# Free Cloud Deployment Guide (Redis, RabbitMQ & Celery)

Here is how you can host the Redis cache, RabbitMQ broker, and Celery background workers in the cloud using generous, production-ready free tiers.

---

## 1. Cloud RabbitMQ Broker (CloudAMQP)

**CloudAMQP** is the industry standard for hosted RabbitMQ instances and offers a free tier.

* **Provider**: [CloudAMQP](https://www.cloudamqp.com/)
* **Plan**: *Little Lemur* (Free)
  * Up to 1,000,000 messages per month
  * Up to 20 concurrent connections
  * Up to 100 queues
* **Setup**:
  1. Register a free account at [CloudAMQP](https://www.cloudamqp.com/).
  2. Click **Create New Instance**, name it (e.g. `cortex-rabbitmq`), and select the **Little Lemur (Free)** plan.
  3. Once initialized, copy the **AMQP URL** (starts with `amqp://` or `amqps://`).
  4. Paste this URL into your backend environment variable:
     ```env
     CELERY_BROKER_URL=amqps://your-user:your-password@your-host.rmq.cloudamqp.com/your-vhost
     ```

---

## 2. Cloud Redis Cache (Upstash or Redis Cloud)

Choose one of these providers to host a free, remote Redis server:

### Option A: Upstash (Recommended)
Upstash offers a Serverless Redis instance with a generous daily request cap.
* **Provider**: [Upstash](https://upstash.com/)
* **Plan**: *Free Tier* (10,000 commands per day, max 256MB storage).
* **Setup**:
  1. Create a free account at [Upstash](https://upstash.com/).
  2. Click **Create Database**, select a region close to your web hosting server (e.g., AWS us-east-1).
  3. Copy the standard connection string under the **Redis Connect** tab (starts with `redis://` or `rediss://`).
  4. Update your environment variables:
     ```env
     REDIS_URL=rediss://default:your_token@your_db.upstash.io:6379
     CELERY_RESULT_BACKEND=rediss://default:your_token@your_db.upstash.io:6379
     ```

### Option B: Redis Cloud
* **Provider**: [Redis.com Cloud](https://redis.com/redis-enterprise-cloud/overview/)
* **Plan**: *Free Subscription* (30MB storage limit, 30 concurrent connections).
* **Setup**:
  1. Register at [Redis Cloud](https://redis.com/try-free/).
  2. Create a free subscription database.
  3. Copy the endpoint address and database password.
  4. Format the Redis URL:
     ```env
     REDIS_URL=redis://default:your_password@your_redis_endpoint_host:port
     CELERY_RESULT_BACKEND=redis://default:your_password@your_redis_endpoint_host:port
     ```

---

## 3. Celery Worker (Where it runs)

**Celery** is not a cloud service itself; it is a Python background process. To run Celery in the cloud for free, you run it on your own container runtime using the environment variable `PROCESS_TYPE=worker`.

### Option A: Railway (Highly Recommended)
Railway lets you deploy multiple services from the same repository.
1. Deploy your backend repository.
2. In the Railway dashboard, create **two** services pointing to the same backend folder:
   * **Service 1 (Web)**: Set environment variable `PROCESS_TYPE=web` (starts Uvicorn).
   * **Service 2 (Worker)**: Set environment variable `PROCESS_TYPE=worker` (starts the Celery worker).
3. Both services will use the exact same Dockerfile, but execute different start scripts dynamically based on `PROCESS_TYPE`.

### Option B: Render
Render offers free tiers for web apps and database storage.
1. Create a new **Web Service** on Render for the FastAPI web server.
2. Create a new **Background Worker** on Render for the Celery worker.
3. Hook both to your GitHub repository and link them to the same Redis (`REDIS_URL`) and RabbitMQ (`CELERY_BROKER_URL`) remote credentials.
