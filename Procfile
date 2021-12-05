web: cd backend && gunicorn — worker-class eventlet -w 1 manage:app
worker: cd backend && python manage.py runworker
clock: python emails.py

