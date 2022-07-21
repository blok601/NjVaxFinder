import requests
import json
import pytz

from datetime import datetime, timedelta
from mysql import connector
from login_info import host, user, password, database, port

link = "https://covid.cdc.gov/covid-data-tracker/COVIDData/getAjaxData?id=vaccination_data"


def get_data(data, day):
    for row in data:
        if row["LongName"] == "New Jersey":
            date = day.strftime("%Y-%m-%d")
            yesterday = day - timedelta(days=1)
            if row["Date"] == date[:10] or row["Date"] == yesterday.strftime("%Y-%m-%d")[:10]:
                return {key: row[key] for key in ["Doses_Distributed", "Doses_Administered",
                                                  "Administered_Dose1_Recip", "Administered_Dose2_Recip"]}


def sql_code(db, data, day, create_table=False):
    cursor = db.cursor()
    if create_table:
        cursor.execute("CREATE TABLE vaccine_data (id int NOT NULL AUTO_INCREMENT, Doses_Distributed int, "
                       "Doses_Administered int, Administered_Dose1_Recip int, Administered_Dose2_Recip int, "
                       "Last_Updated varchar(255), PRIMARY KEY (id))")
        db.commit()
        return False

    cursor.execute("DELETE FROM vaccine_data")
    cursor.execute(
        "INSERT INTO vaccine_data (Doses_Distributed, Doses_Administered, Administered_Dose1_Recip, Administered_Dose2_Recip, Last_Updated) VALUES ({}, {}, {}, {}, \'{}\')".format(
            *data.values(), day))

    db.commit()


def main(db):
    data = json.loads(requests.get(link).content)["vaccination_data"]
    now = datetime.now(pytz.timezone("US/Eastern"))
    vaccine_data = get_data(data, now)
    today = now.strftime("%B %d, %Y %I:%M %p EST")
    sql_code(db, vaccine_data, today)
    print(vaccine_data)


if __name__ == '__main__':
    # db = connector.connect(host=host, user=user, password=password, database=database, port=port)
    main(1)
