from apscheduler.schedulers.blocking import BlockingScheduler
import requests

sched = BlockingScheduler()


@sched.scheduled_job("cron", day_of_week="mon", hour=12)
def scheduled_job():
    # python requests
    # r = requests.get("localhost:5000/api/notifications/weeklyemails")
    r = requests.get("https://app.menteeglobal.org/api/notifications/weeklyemails")
    print(r.status_code)


sched.start()
