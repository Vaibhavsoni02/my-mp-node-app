// app.js
console.log('Hello, Node.js is running on Mac!');

// grab the Mixpanel factory
const Mixpanel = require('mixpanel');
const fs = require('fs');
const { title } = require('process');
 
// create an instance of the mixpanel client
const mixpanel = Mixpanel.init('f498a6a0cf2f2860b8529cd8ecd7f5c3', {
    host: "api.mixpanel.com",
    protocol: 'http',      // Use HTTP instead of HTTPS
    keepAlive: false,      // Turn off keepAlive (reestablish connection on each request)
    debug: true,           // Enable debug mode
    gelocation: false     // The geolocate boolean setting needs to be false for Mixpanel to infer the location based on the ip property provided in the event payload.
});

// Read the payload.json file
fs.readFile('payload.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        return;
    }
    
    // Parse the JSON data
    let payload = JSON.parse(data);
    
    // VERY IMPORTANT FOR ID MANAGEMENT
    
    // Change the key 'em_guid' to '$device_id'
    if (payload.em_guid) {
        payload.$device_id = payload.em_guid;
        delete payload.em_guid; // Remove the old key
    }
    // Change the key 'uuid' to '$user_id'
    if (payload.uuid) {
        payload.$user_id = payload.uuid;
        delete payload.uuid; // Remove the old key
    }
    // delete the super property payload
    // delete payload.value; // Remove the old key

    

    // create or update a user in Mixpanel
    mixpanel.people.set(payload.$user_id, {
        $created: (new Date()).toISOString(), 
        $first_name: payload.$first_name,
        $last_name: payload.$last_name,
        $email: payload.email,
        $phone: payload.phoneNumber,
        classroom_code: payload.classroom_code,
        $avatar: payload.profile_image,
        persona: payload.package_type,
        $name: payload.$name,
        school: payload.school,
        school_id: payload.school_id,
        package_type: payload.package_type,
        class: payload.class,
        board: payload.board


    });

    // Track an event with the modified payload
    mixpanel.track(payload.event_name || 'No Event Name', {
        ...payload, // Spread the modified payload
        ...payload.value?.mixpanel_property, // Spread the mixpanel_property object inside value, if it exists
        ...payload.value,   // Spread the value object, if it exists
        // $latitude: 24.497146,   // Additional properties
        // $longitude: 81.378036,
        //ip: '49.36.18.93',    // Note that ip is used for event payloads, and $ip is used for profile payloads.
        // $device_id: 'random_id1267534',  // When a user is anonymous, the events should include a $device_id property that stores the Anonymous ID whch is em_guid in our case.
        // $user_id: "mango", 
        // distinct_id: 'unique client id',   // not to be send directly let mixpanel handle it their way via device and user ids
        $os: payload.os,
        $os_version: payload.osVersion,
        $browser: payload.browser,
        $browser_version: payload.browserVersion,
        $manufacturer: payload.deviceVendor,
        $model: payload.deviceModel,
        $brand: payload.deviceType,
        user_channel: payload.app_platform,
        title: payload.page_title,
        url: `https://${payload.page_urlhost}${payload.page_pathname}`
    }
    
    

    , (err) => {
        if (err) {
            console.error('Failed to send event:', err);
        } else {
            console.log('Event sent successfully!');
        }
    });
});


