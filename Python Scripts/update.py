import google_docs_data
import vaccine_data
import time

from mysql import connector
from login_info import host, user, password, database, port

if __name__ == '__main__':
    db = connector.connect(host=host, user=user, password=password, database=database, port=port)
    running = True
    while running:
        google_docs_data.main(db)
        vaccine_data.main(db)
        print("Updated poggers")
        for _ in range(60 * 60 * 4):
            time.sleep(1)  # Shorter time.sleep allows for more of a window to ctrl + c - KeyboardInterrupt
