import requests
import time
import random

import warnings
warnings.filterwarnings('ignore')


#total animal quantitiy is 9 so, data transfer period is 60/9 = ... 6sec
rfid_arr = ["410100008131753", "410100008131325", "410100008131982", "410100008131960", "410100008131672",
        "410100008131488", "410100008131856", "410100008177906", "410100008131294"]

i = 0
while True:
    
    if i == 9:
        i = 0
        
    rfid = rfid_arr[i]
    
    ten = random.randrange(37, 40) 
    one = random.randrange(0, 10)
    temp_str = "" + str(ten) +"."+ str(one)
    if(float(temp_str) > 39.1) :
        tmp_str = temp_str = "" + str(ten-1) +"."+ str(one)

    breath = random.randrange(25, 31) 

    datas = {
        "rfid":rfid,
        "temp":temp_str,
        "breath":breath
    }
    
    print("datas : ", datas)

    url = "https://arc1el.iptime.org:3000/api/get_sensor_data"
    response = requests.post(url, data = datas, verify=False)
    
    print("res : ", response)

    del ten, one, temp_str, breath, datas
    
    i += 1
    
    time.sleep(6)
