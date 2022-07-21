"""
All credit goes to Shaan Choudhri Lawrenceville '24.

pip3 install gspread
pip3 install --upgrade google-api-python-client oauth2client
pip install mysql-connector-python


"""
import json

import gspread
import requests

from oauth2client.service_account import ServiceAccountCredentials
from mysql import connector
from login_info import host, user, password, database, port
from pprint import pprint
from bs4 import BeautifulSoup


def do_sql(db, locations, one_time="", test=False, delete_remake=False):
    
    cursor = db.cursor()

    if test:
        cursor.execute("SELECT * FROM places")
        print(*cursor.fetchall(), sep="\n")
        return True

    if one_time:
        cursor.execute(one_time)
        db.commit()
        return True

    if delete_remake:
        sql = "DROP TABLE places"
        sql1 = "CREATE TABLE places (iid int NOT NULL AUTO_INCREMENT, pname varchar(255), address varchar(255), phone varchar(255), link varchar(255), zip varchar(255), lat FLOAT(24), lng FLOAT(24), PRIMARY KEY (iid))"
        cursor.execute(sql)
        cursor.execute(sql1)

    cursor.execute("SELECT * FROM places")
    all_data = cursor.fetchall()

    api_key = "AIzaSyClhA3qUFMc0FNXJWAxxuE7vzEWDsjqu2A"

    # name, address, phone, link, zip
    counter = 0
    added = 0
    for place in locations:
        br = 0
        for row in all_data:
            if place["Address"] in row:
                print(f"Duplicate:   {place['Name']}")
                counter += 1
                br = 1

        if br:
            continue
        
        address = place["Address"].replace(", ", " ").replace(" ", "%20")
        api_call = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"

        content = json.loads(requests.get(api_call).content)
        
        if content["status"] != "OK":
            lat, lng = 0.0, 0.0
        else:
            info = content["results"][0]["geometry"]["location"]
            lat, lng = info["lat"], info["lng"]

        sql = "INSERT INTO places (pname, address, phone, link, zip, lat, lng) VALUES (\'{}\', \'{}\', \'{}\', \'{}\', \'{}\', {}, {});".format(
            place["Name"], place["Address"], place["Phone Number"], place["Link"], place["Zip Code"], lat, lng
        )
        try:
            cursor.execute(sql)
            print("Added: ", place["Name"], place["Zip Code"], lat, lng, sep='---')
            added += 1
        except connector.errors.ProgrammingError as e:
            if "for the right syntax to use near \'s" in str(e):
                print("apostrophe error", place["Name"], sep=" --- ")
            else:
                print(e)

    print(f"For Google Docs --- Duplicates: {counter}. Added: {added}. Total: {len(locations)}")
    db.commit()


scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)

client = gspread.authorize(creds)

sheet = client.open("NJ Vaccination Centers")
sheet = sheet.get_worksheet(0)

data = sheet.get_all_records()


# name, address, phone, link, zip
def get_locations(data):
    locations = []
    for row in data:
        if row["Link"] in ["https://www.cvs.com/immunizations/covid-19-vaccine", "https://vaccines.shoprite.com/",
                           "riteaid.com",
                           "https://www.wegmans.com/news-media/articles/covid-19-vaccines/#1611240408647-94b1a260-a334"]:
            continue
        address = row["Address"]
        if isinstance(row["Address"], int):
            if len(str(row["Address"])) == 4:
                address = f"0{row['Address']}"
            else:
                continue

        if not (row["Phone Number"]) or len(address) < 5 or row["Name"] == "Shaans Pharmacy":
            continue

        zip_code = address[-5:]
        if not zip_code.isnumeric():
            continue

        location = {key: row[key] for key in ["Phone Number", "Link", "Name"]}
        location["Address"] = address
        location["Zip Code"] = zip_code
        br = 0
        for value in location.values():
            if not value:
                br = 1
                break
        if br:
            continue

        if location not in locations:
            locations.append(location)

    """
    for place in locations:
        address = place["Address"].replace(", ", " ").replace(" ", "%20")

        api_call = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"

        content = json.loads(requests.get(api_call).content)

        json_d = place
        json_d["id"] = locations.index(place) + 1

        if content["status"] != "OK":
            json_d["lat"], json_d["long"] = 0.0, 0.0
        else:
            info = content["results"][0]["geometry"]["location"]
            json_d["lat"], json_d["long"] = info["lat"], info["lng"]

        json_stuff.append(json_d)

    with open("places.json", "w", encoding="utf-8") as f:
        json.dump(json_stuff, f, ensure_ascii=False, indent=4)

    """

    return locations

def zip_lat(db, test=False, delete_remake=False):
    cursor = db.cursor()

    if delete_remake:
        zip_loc_create = "CREATE TABLE zip_loc (zip varchar(255), lat FLOAT(24), lng FLOAT(24), PRIMARY KEY (zip))"
        cursor.execute("DROP TABLE zip_loc")
        cursor.execute(zip_loc_create)

    if test:
        cursor.execute("SELECT * FROM zip_loc")
        for row in cursor.fetchall():
            if row[1:3] in [(0.0, 0.0), [0.0, 0.0]]:
                print(row)

        return False

    # zip_codes = [zip_code[0] for zip_code in cursor.fetchall()] # string - THIS IS THE OLD ONE
    zip_link = "https://www.zipdatamaps.com/list-of-zip-codes-in-new-jersey.php"

    text = requests.get(zip_link).text
    soup = BeautifulSoup(text, "html.parser")

    zip_codes = [row.td.text for row in soup.find_all("tr") if "adsbygoogle" not in row.td.text] # THIS GIVES EVERY ZIP CODE IN NEW JERSEY

    api_key = "AIzaSyClhA3qUFMc0FNXJWAxxuE7vzEWDsjqu2A"
    counter = 0
    for code in zip_codes:
        api_call = f"https://maps.googleapis.com/maps/api/geocode/json?address={code}&key={api_key}"

        content = json.loads(requests.get(api_call).content)

        if content["status"] != "OK":
            if code == "07463":
                lat, lng = 41.01322200, -74.12605700
            elif code == "08644":
                lat, lng = 40.23000000, -74.64800000
            else:
                lat, lng = 0.0, 0.0
        else:
            info = content["results"][0]["geometry"]["location"]
            lat, lng = info["lat"], info["lng"]
        
        sql = f"INSERT INTO zip_loc VALUES (\'{code}\', {lat}, {lng})"
        
        try:
            cursor.execute(sql)
            print("Added", code, sep=" --- ")
        except connector.errors.ProgrammingError as e:
            print(e)
        except connector.errors.IntegrityError as e:
            print("duplicate", code, sep=" --- ")
            counter += 1

    db.commit()

    print(f"For zip Codes --- Duplicates: {counter}, Total: {len(zip_codes)}")


def main(db):
    do_sql(db, get_locations(data))


if __name__ == '__main__':
    db = connector.connect(host=host, user=user, password=password, database=database, port=port)
    # zip_lat(db, test=True)
    locations = get_locations(data)
    do_sql(db, locations)
    # do_sql(db, [], test=True)
    # zip_lat(db, test=True)
    # do_sql(db, [], test=True)
    # tst(db)
    # json['results'][0]['geometry']['location'] - {'lat: float, 'lng': float'}
    """
    api_key = "AIzaSyClhA3qUFMc0FNXJWAxxuE7vzEWDsjqu2A"
    d = get_locations(data)
    add1 = [place["Address"] for place in d][0]

    address = add1.replace(", ", " ").replace(" ", "%20")
    api_call = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}"

    content = json.loads(requests.get(api_call).content)
    pprint(content)
    info = content["results"][0]["geometry"]["location"]
    print(info["lat"], info["lng"])
    """
