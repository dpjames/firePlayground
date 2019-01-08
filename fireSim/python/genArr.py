from osgeo import gdal
import json
#################################
def toJSON(arr):
    js = "["
    for row in arr:
        js+=json.dumps(row.tolist()) + ",\n"
    js = js[0:len(js) - 1] + "]"
    return js

ds = gdal.Open("paradise.tif")
arr =ds.GetRasterBand(1).ReadAsArray()
ma = arr[0][0]
mi = arr[0][0]
for x in arr:
    for y in x:
        if y > ma:
            ma = y
        if y < mi:
            mi = y
print toJSON(arr)
