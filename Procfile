web: cd backend && gunicorn --worker-class eventlet manage:app
worker: cd backend && python manage.py runworker
clock: python emails.py

