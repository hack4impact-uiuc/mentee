web: cd backend && gunicorn --worker-class eventlet -b :5000 manage:app
worker: cd backend && python manage.py runworker
clock: python emails.py

