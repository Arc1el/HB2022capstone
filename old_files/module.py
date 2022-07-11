from bluetooth import *
import asyncio
import sys
import json
from collections import OrderedDict
import time
import requests
import warnings
warnings.filterwarnings('ignore')

socket1 = BluetoothSocket( RFCOMM )
socket1.connect(("98:DA:60:01:C4:46", 1)) 
print("bluetooth1 connected!")

socket2 = BluetoothSocket( RFCOMM )
socket2.connect(("98:DA:60:02:94:D4", 1))
print("bluetooth2 connected!")



async def get_ecg_data():
    ecgrawdat = socket2.recv(960)
    list_dat = list(ecgrawdat)
    print("ECG data size = ", sys.getsizeof(list_dat))
    print("ECG data length = ", len(list_dat))
    #for i in range(0, len(list_dat)):
    #    print(list_dat[i], "",  end = "")
    return list_dat

async def main():
    #for outliear temperatures. inital value
    outlier_temp = 38.5
    
    while True:
        start = time.time()
        print(start)
        ecgdat = await get_ecg_data()
        rawdat = socket1.recv(960)
        data = list(rawdat)
          
        # temperature data
        # if data was oulier value, replace to previous data
        if data[0]+0.1 * data[1] < 20 or data[0]+0.1 * data[1] > 60:
            print("\nNow Temperature : ", outlier_temp)
        else:
            outlier_temp = data[0]+* data[1]
            print("\nNow Temperature : ", data[0]+0.1 * data[1])
        
        # Accel data, x, y, z
        print("x, y, z data sum for 1 sec : ", data[2], data[3], data[4]);
        
        # Execute time
        print("Total execute time : ", time.time() - start)
        
        json_data = OrderedDict()
        json_data["temp"] = outlier_temp
        json_data["accel"] = [data[2], data[3], data[4]]
        json_data["ecg_amount"] = len(ecgdat)
        json_data["ecg"] = ecgdat
        json_data["deviceid"] = 1111
        
        print(json.dumps(json_data))
        
        response = requests.post(url = "https://arc1el.iptime.org:8000/getdata",
                                data = json.dumps(json_data),
                                headers = {'Content-type': 'application/json', 'Accept': 'text/plain'},
                                verify = False)
        
if __name__ == "__main__":
    asyncio.run(main())
