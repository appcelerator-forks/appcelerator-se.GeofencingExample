// --------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------
var Geofence = require('ti.geofence');
function isIOS7Plus() {
    if (Titanium.Platform.name == 'iPhone OS')
    {
        var version = Titanium.Platform.version.split('.');
        var major = parseInt(version[0],10);
 
        if (major >= 7) {
            return true;
        }
    }
    return false;
}
var osname = Ti.Platform.osname,
    ANDROID = (osname === 'android'),
    IOS = (osname === 'iphone' || osname === 'ipad'),
    IOS7PLUS = isIOS7Plus(),
    defaultFontSize = ANDROID ? '16dp' : 14;

// --------------------------------------------------------------------
// Geofence Regions
// --------------------------------------------------------------------
var regionHQ = Geofence.createRegion({
    center: { 
        latitude:43.148632,
        longitude:-77.5970798
    },
    radius:100.0,
    identifier:'HQ - First Data'
});

var region1 = Geofence.createRegion({
    center: { 
        latitude:43.1854747,
        longitude:-77.6165028,
    },
    radius:500.0, // meters
    identifier:'Rohrbach Brewing Company'
});
var region2 = Geofence.createRegion({
    center: { 
        latitude:43.1572916,
        longitude:-77.597559
    },
    radius:500.0, // meters
    identifier:'2Vine'
});
var region3 = Geofence.createRegion({
    center: { 
        latitude:43.154876,
        longitude:-77.594864
    },
    radius:500.0, // meters
    identifier:'MacGregors'
});

// --------------------------------------------------------------------
// Setup Table Rows
// --------------------------------------------------------------------
var rows = [
    {
        title: 'startMonitoringForRegions() HQ',
        onClick: function(){
            logInApp('REGION: ' + regionHQ + ' with identifier: ' + regionHQ.identifier);
            Geofence.startMonitoringForRegions(regionHQ);
        }
    },
    {
        title: 'startMonitoringForRegions() - Pub Crawl',
        onClick: function(){
            logInApp('startMonitoringForRegions() Pub Crawl');
            Geofence.startMonitoringForRegions([region1, region2, , region3, regionHQ]);
        }
    },
    {
        title: 'stopMonitoringForRegions() - Pub Crawl',
        onClick: function(){
            logInApp('stopMonitoringForRegions()');
            Geofence.stopMonitoringForRegions([region1, region2, region3, regionHQ]);
        }
    },
    {
        title: 'stopMonitoringAllRegions()',
        onClick: function(){
            logInApp('stopMonitoringAllRegions()');
            Geofence.stopMonitoringAllRegions();
        }
    }
];

// iOS only methods
if (IOS) {
    var iosRows = [
        {
            title: 'regionMonitoringAvailable() (iOS)',
            onClick: function(){
                logInApp('regionMonitoringAvailable: ' + Geofence.regionMonitoringAvailable());
            }
        },
        {
            title: 'containsCoordinate() HQ (iOS ONLY)',
            onClick: function(){
                var region = Geofence.createRegion({
                    center: { 
                        latitude:37.389601,
                        longitude:-122.050169
                    },
                    radius:50,
                    identifier:'Appcelerator'
                });
                // Should be true
                logInApp('containsCoordinate: ' + region.containsCoordinate({
                    latitude:37.389610,
                    longitude:-122.050170
                }));
            }
        },
        {
            title: 'monitoredRegions (iOS ONLY)',
            onClick: function(){
                logInApp('monitoredRegions length: ' + Geofence.monitoredRegions.length);
            }
        }
    ];
    rows = rows.concat(iosRows);
}

// Android only methods
if (ANDROID) {
    var androidRows = [
        {
            title: 'isGooglePlayServicesAvailable() (Android ONLY)',
            onClick: function(){
                logInApp('isGooglePlayServicesAvailable: ' + Geofence.isGooglePlayServicesAvailable());
            }
        },
        {
            title: 'Constants (Android)',
            onClick: function(){
                logInApp('SUCCESS: ' + Geofence.SUCCESS);
                logInApp('SERVICE_MISSING: ' + Geofence.SERVICE_MISSING);
                logInApp('SERVICE_VERSION_UPDATE_REQUIRED: ' + Geofence.SERVICE_VERSION_UPDATE_REQUIRED);
                logInApp('SERVICE_DISABLED: ' + Geofence.SERVICE_DISABLED);
                logInApp('SERVICE_INVALID: ' + Geofence.SERVICE_INVALID);

                logInApp('LOCATION_STATUS_ERROR: ' + Geofence.LOCATION_STATUS_ERROR);
                logInApp('LOCATION_STATUS_GEOFENCE_NOT_AVAILABLE: ' + Geofence.LOCATION_STATUS_GEOFENCE_NOT_AVAILABLE);
                logInApp('LOCATION_STATUS_GEOFENCE_TOO_MANY_GEOFENCES: ' + Geofence.LOCATION_STATUS_GEOFENCE_TOO_MANY_GEOFENCES);
                logInApp('LOCATION_STATUS_GEOFENCE_TOO_MANY_PENDING_INTENTS: ' + Geofence.LOCATION_STATUS_GEOFENCE_TOO_MANY_PENDING_INTENTS);
            }
        },
    ];
    rows =  rows.concat(androidRows);
}

// Clear app badge when the app is opened
if (IOS) {
    Ti.UI.iPhone.appBadge = 0;
    Ti.App.addEventListener('resume', function() {
        Ti.UI.iPhone.appBadge = 0;
    });
}



// --------------------------------------------------------------------
// Geofence Event Listners
// --------------------------------------------------------------------

Geofence.addEventListener('error', function(e) {
    logInApp('####### ERROR #######: ' + JSON.stringify(e));
});

Geofence.addEventListener('enterregions', function(e) {
    logInApp('####### enterregion #######: ' + JSON.stringify(e));
    for (var i = 0, j = e.regions.length; i < j; i++) {
        logInApp('Region id: ' + e.regions[i].identifier);
    }

    // Display local notification
    showNotification({
        title: 'ENTER',
        body: 'enter - ' + e.regions[0].identifier
    });
});

Geofence.addEventListener('exitregions', function(e) {
    logInApp('####### exitregion #######: ' + JSON.stringify(e));
    for (var i = 0, j = e.regions.length; i < j; i++) {
        logInApp('Region id: ' + e.regions[i].identifier);
    }

    // Display local notification
    showNotification({
        title: 'EXIT',
        body: 'exit - ' + e.regions[0].identifier
    });
});

Geofence.addEventListener('monitorregions', function(e) {
    // Triggered when new regions are added to be monitored
    logInApp('####### monitorregion #######: ' + JSON.stringify(e));
    for (var i = 0, j = e.regions.length; i < j; i++) {
        logInApp('Region id: ' + e.regions[i].identifier);
    }
});

Geofence.addEventListener('removeregions', function(e) {
    // Triggered on Android when regions are removed and are no longer being monitored
    logInApp('####### removeregions #######: ' + JSON.stringify(e));
});

// --------------------------------------------------------------------
// UI
// --------------------------------------------------------------------

var win = Ti.UI.createWindow({
    backgroundColor: 'white'
});

var textLog = Ti.UI.createTextArea({
    top: IOS7PLUS ? 20 : 0,
    height: '30%',
    width: '100%',
    borderWidth: '2',
    borderColor: '#000',
    color: '#000',
    backgroundColor: '#FFF',
    focusable: false,
    font: {
        fontSize: defaultFontSize
    },
    value: 'AppLog: this log scrolls backwards (newest === top)'
});
win.add(textLog);

if (ANDROID) {
    for (var i = 0, j = rows.length; i < j; i++) {
        rows[i].font = {fontSize: defaultFontSize};
        rows[i].height = '50dp';
        rows[i].color = '#000';
    }
}

var tableView = Ti.UI.createTableView({
    top: '30%',
    data: rows
});
tableView.addEventListener('click', function(e){
    rows[e.index].onClick && rows[e.index].onClick();
});
win.add(tableView);

function logInApp(text) {
    textLog.value = text + '\n' + textLog.value;
    Ti.API.info(text);
}

win.open();

// --------------------------------------------------------------------
// Utilities
// --------------------------------------------------------------------

var notificationCount = 1;
function showNotification(params) {
    var params = params || {},
        title = params.title || '',
        body = params.body || '';

    if (ANDROID) {
        var activity = Ti.Android.currentActivity;
        var intent = Ti.Android.createIntent({
            action: Ti.Android.ACTION_MAIN,
            // you can use className or url to launch the app
            // className and packageName can be found by looking in the build folder
            // for example, mine looked like this
            // build/android/gen/com/appcelerator/test/Test7Activity.java
            // className : 'com.appcelerator.test.Test7Activity',
     
            // if you use url, you need to make some changes to your tiapp.xml
            // SEE: http://docs.appcelerator.com/titanium/latest/#!/guide/Android_Notifications-section-29004809_AndroidNotifications-Usingtheurlproperty
            url: 'app.js',
            flags: Ti.Android.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED | Ti.Android.FLAG_ACTIVITY_SINGLE_TOP
        });
        intent.addCategory(Titanium.Android.CATEGORY_LAUNCHER);
     
        var pending = Ti.Android.createPendingIntent({
            activity: activity,
            intent: intent,
            type: Ti.Android.PENDING_INTENT_FOR_ACTIVITY,
            flags: Ti.Android.FLAG_ACTIVITY_NO_HISTORY
        });
     
        var notification = Ti.Android.createNotification({
            contentIntent: pending,
            contentTitle: title,
            contentText: body,
            // 'when' will only put the timestamp on the notification and nothing else.
            // Setting it does not show the notification in the future
            when: new Date().getTime(),
            icon: Ti.App.Android.R.drawable.appicon,
            flags: Titanium.Android.ACTION_DEFAULT | Titanium.Android.FLAG_AUTO_CANCEL | Titanium.Android.FLAG_SHOW_LIGHTS
        });

        // Using a different notification count for each notification
        // Using the same number as a previously displayed notification will update it
        Ti.Android.NotificationManager.notify(notificationCount++, notification);

    } else if (IOS) {
        Ti.App.iOS.scheduleLocalNotification({
            alertAction: title,
            alertBody: body,
            date: new Date(new Date().getTime() + 2000) // Needs to be scheduled in the future 
        });

        // Show the number of notifications using the app badge
        Ti.UI.iPhone.appBadge++;
    } else {
        Ti.API.info('Can not show notification on unsupported platform `' + osname + '`');
    }
}