import json
import sys

import pandas as pd
import requests

# get the seasonid from command line
seasonid = sys.argv[1]

endpoint = "https://codm-op.timi-esports.qq.com/web/codm/getPlayerRanking"
data = {"game_mode": "FULL", "seasonid": seasonid}
response = requests.post(endpoint, data=json.dumps(data))
# Get the Content fron the response object
if response.status_code == 200:
    responseData = response.content
else:
    sys.exit()

# convert resopnse content to json for pandas
responseJson = json.loads(responseData)

# Create df from response
df = pd.json_normalize(responseJson, record_path=["data", "rank"])

# extract player id and Name from the df
playerDF = df[["player_id", "player_name"]].copy()
playerDF["player_name"] = playerDF["player_name"].str.lower()

playerDF.to_json(f"players_{seasonid}.json", orient="records", force_ascii=False)
