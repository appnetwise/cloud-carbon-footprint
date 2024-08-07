#!/usr/bin/env sh

#
# © 2021 Thoughtworks, Inc.
#
echo REACT_APP_PREVIOUS_YEAR_OF_USAGE=$REACT_APP_PREVIOUS_YEAR_OF_USAGE > .env
echo REACT_APP_DATE_RANGE_VALUE=$REACT_APP_DATE_RANGE_VALUE >> .env
echo REACT_APP_DATE_RANGE_TYPE=$REACT_APP_DATE_RANGE_TYPE >> .env
echo REACT_APP_GROUP_BY=$REACT_APP_GROUP_BY >> .env
echo REACT_APP_MINIMAL_DATE_AGE=$REACT_APP_MINIMAL_DATE_AGE >> .env
echo REACT_APP_MSAL_AUTHORITY=$REACT_APP_MSAL_AUTHORITY >> .env
echo REACT_APP_MSAL_CLIENT_ID=$REACT_APP_MSAL_CLIENT_ID >> .env
echo REACT_APP_MSAL_REDIRECT_URI=$REACT_APP_MSAL_REDIRECT_URI >> .env
echo REACT_APP_MSAL_POST_LOGOUT_REDIRECT_URI=$REACT_APP_MSAL_POST_LOGOUT_REDIRECT_URI >> .env