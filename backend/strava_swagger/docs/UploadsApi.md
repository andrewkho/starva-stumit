# strava_swagger.UploadsApi

All URIs are relative to *https://www.strava.com/api/v3*

Method | HTTP request | Description
------------- | ------------- | -------------
[**create_upload**](UploadsApi.md#create_upload) | **POST** /uploads | Upload Activity
[**get_upload_by_id**](UploadsApi.md#get_upload_by_id) | **GET** /uploads/{uploadId} | Get Upload

# **create_upload**
> Upload create_upload(file=file, name=name, description=description, trainer=trainer, commute=commute, data_type=data_type, external_id=external_id)

Upload Activity

Uploads a new data file to create an activity from. Requires activity:write scope.

### Example
```python
from __future__ import print_function
import time
import strava_swagger
from strava_swagger.rest import ApiException
from pprint import pprint

# Configure OAuth2 access token for authorization: strava_oauth
configuration = strava_swagger.Configuration()
configuration.access_token = 'YOUR_ACCESS_TOKEN'

# create an instance of the API class
api_instance = strava_swagger.UploadsApi(strava_swagger.ApiClient(configuration))
file = 'file_example' # file |  (optional)
name = 'name_example' # str |  (optional)
description = 'description_example' # str |  (optional)
trainer = 'trainer_example' # str |  (optional)
commute = 'commute_example' # str |  (optional)
data_type = 'data_type_example' # str |  (optional)
external_id = 'external_id_example' # str |  (optional)

try:
    # Upload Activity
    api_response = api_instance.create_upload(file=file, name=name, description=description, trainer=trainer, commute=commute, data_type=data_type, external_id=external_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UploadsApi->create_upload: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **file** | **file**|  | [optional] 
 **name** | **str**|  | [optional] 
 **description** | **str**|  | [optional] 
 **trainer** | **str**|  | [optional] 
 **commute** | **str**|  | [optional] 
 **data_type** | **str**|  | [optional] 
 **external_id** | **str**|  | [optional] 

### Return type

[**Upload**](Upload.md)

### Authorization

[strava_oauth](../README.md#strava_oauth)

### HTTP request headers

 - **Content-Type**: multipart/form-data
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **get_upload_by_id**
> Upload get_upload_by_id(upload_id)

Get Upload

Returns an upload for a given identifier. Requires activity:write scope.

### Example
```python
from __future__ import print_function
import time
import strava_swagger
from strava_swagger.rest import ApiException
from pprint import pprint

# Configure OAuth2 access token for authorization: strava_oauth
configuration = strava_swagger.Configuration()
configuration.access_token = 'YOUR_ACCESS_TOKEN'

# create an instance of the API class
api_instance = strava_swagger.UploadsApi(strava_swagger.ApiClient(configuration))
upload_id = 789 # int | The identifier of the upload.

try:
    # Get Upload
    api_response = api_instance.get_upload_by_id(upload_id)
    pprint(api_response)
except ApiException as e:
    print("Exception when calling UploadsApi->get_upload_by_id: %s\n" % e)
```

### Parameters

Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
 **upload_id** | **int**| The identifier of the upload. | 

### Return type

[**Upload**](Upload.md)

### Authorization

[strava_oauth](../README.md#strava_oauth)

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

