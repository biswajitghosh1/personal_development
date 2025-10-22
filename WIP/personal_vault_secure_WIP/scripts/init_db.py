import os
import secrets
from backend.db import init_app_db, create_user_if_none

def main():
    init_app_db()
    created, username, password = create_user_if_none()
    if created:
        print("Admin user created")
        print(f" USERNAME: {username}")
        print(f" PASSWORD: {password}")
        print("Change the password after first login.")
    else:
        print("Users exist already; no admin created.")

if __name__ == "__main__":
    main()
