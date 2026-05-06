# Stage 1

To support the campus notification platform, the REST API needs to handle fetching notifications and marking them as read.

**REST API Endpoints:**

1. **Fetch Unread Notifications**
   - **Endpoint:** `GET /api/v1/notifications?status=unread`
   - **Headers:** `Authorization: Bearer <token>`
   - **Response (200 OK):**
     ```json
     {
       "data": [
         {
           "id": "550e8400-e29b-41d4-a716-446655440000",
           "type": "Placement",
           "message": "Infosys is visiting campus next week.",
           "createdAt": "2023-10-15T10:00:00Z"
         }
       ]
     }
     ```

2. **Mark Notification as Read**
   - **Endpoint:** `PATCH /api/v1/notifications/:id/read`
   - **Headers:** `Authorization: Bearer <token>`
   - **Request:** Empty body
   - **Response (200 OK):**
     ```json
     {
       "message": "Notification marked as read."
     }
     ```

**Real-Time Mechanism:**
For real-time delivery, Server-Sent Events (SSE) is the best approach. SSE maintains a persistent, one-way connection from the server to the client. Since notifications are just pushed from the backend and the client simply listens for incoming alerts, SSE is much lighter and easier to maintain than full bidirectional WebSockets.

# Stage 2

**Persistent Storage Suggestion:**
I recommend using PostgreSQL. Since notifications have a rigid structure, clear relationships to students, and require reliable storage where we can't afford to drop messages, a relational database with ACID compliance is ideal. 

**Database Schema:**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INT NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Data Volume Problems & Solutions:**
As the system scales to millions of rows, basic read and write operations will slow down because the index trees become massive. To solve this, we can implement table partitioning by date (e.g., partitioning by month). Since older notifications are rarely accessed, we can eventually move data older than 6 months into an archive table to keep the active working set small and fast.

**Queries based on the schema:**
```sql
SELECT id, message, notification_type, created_at 
FROM notifications 
WHERE student_id = 1042 AND is_read = false 
ORDER BY created_at DESC;
```

# Stage 3

**Is this query accurate?**
Yes, it is functionally accurate. It correctly fetches the unread notifications for a specific student and sorts them chronologically.

**Why is this slow?**
It is slow because there are no indexes on the `studentID` and `isRead` columns. Without an index, the database engine is forced to perform a full table scan, examining all 5,000,000 rows to find matches.

**What would you change?**
I would add a composite index on `(studentID, isRead, createdAt)`. The computation cost would drop dramatically from O(N) (linear scan) to O(log N) (b-tree traversal). The database would instantly locate the exact block of unread rows for that student and retrieve them already sorted.

**Is indexing every column effective?**
No, indexing every column is a terrible idea. While indexes speed up read queries, they drastically slow down write operations (INSERT, UPDATE, DELETE) because every index tree has to be updated whenever data changes. They also consume a massive amount of disk space.

**Query for Placement notifications in the last 7 days:**
```sql
SELECT DISTINCT studentID 
FROM notifications 
WHERE notificationType = 'Placement' 
  AND createdAt >= NOW() - INTERVAL '7 days';
```

# Stage 4

Fetching notifications directly from the database on every single page load is highly inefficient and creates unnecessary load.

**Solution:**
We should introduce a caching layer using Redis. When a student logs in, we query the DB once and cache their unread notifications. On subsequent page navigations, the frontend quickly retrieves the data from memory via Redis. When a new notification arrives or is marked as read, we update both the DB and invalidate the cache. 

**Tradeoffs:**
Using Redis heavily improves read speeds and protects the database from traffic spikes. However, the tradeoff is increased infrastructure complexity. You now have to manage cache invalidation logic carefully; if the cache isn't cleared properly when a notification is read, the user will experience a bug where they see stale, already-read notifications.

# Stage 5

**Shortcomings of the pseudocode:**
1. **Synchronous Blocking:** Running a loop for 50,000 students in a single thread will take a very long time. It blocks the server process.
2. **No Fault Tolerance:** Because there's no error handling, if the `send_email` API throws a timeout error midway, the script crashes, and the remaining students are left unnotified (which explains why 200 failed).

**Should DB save and Email happen together?**
No, they absolutely should not happen synchronously. Database inserts are fast and internal. Sending an email relies on an external network API that is slow, has rate limits, and is prone to failure. They must be decoupled so that a slow email server doesn't break the application.

**Redesign for Reliability:**
We should use an asynchronous Message Queue (like RabbitMQ or AWS SQS). The main function should just do a bulk database insert and publish jobs to the queue. Background workers will pick up these jobs and handle the actual emailing and push notifications. This allows for parallel processing and automatic retries on failure.

**Revised Pseudocode:**
```python
function notify_all(student_ids: array, message: string):
    # Fast, reliable bulk insert into the database
    batch_save_to_db(student_ids, message)
    
    # Push lightweight jobs to a message queue for processing
    for student_id in student_ids:
        enqueue_notification_job(student_id, message)

# This runs independently on background worker servers
function process_notification_job(job):
    try:
        push_to_app(job.student_id, job.message)
        send_email(job.student_id, job.message)
    except EmailAPIError:
        # Fails gracefully and puts the job back in queue to retry later
        mark_job_for_retry(job)
```
