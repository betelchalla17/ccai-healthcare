// Import the Firestore client library
const Firestore = require('@google-cloud/firestore');

// Define the project ID and initialize Firestore
const PROJECTID = 'my-project-ccao';
const firestore = new Firestore({
  projectId: PROJECTID,
});

// Main function to handle appointment time update
exports.updateAppointmentTime = async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('Dialogflow Request body:', JSON.stringify(req.body));

    // Retrieve the tag and account ID from the request
    const tag = req.body.fulfillmentInfo?.tag;
    console.log('Tag:', tag);

    const accountID = req.body.sessionInfo.parameters.account_id; // Extract account_id from session parameters
    console.log('Account ID fetched:', accountID);

    // Check if the tag is 'appointment-reschedule' to process the reschedule request
    if (tag === 'appointment-reschedule') {
      console.log('Processing appointment reschedule');

      // Extract the new appointment time from the request
      const newAppointmentTime = req.body.sessionInfo.parameters.new_appointment_time;
      console.log('New Appointment Time:', newAppointmentTime);

      // Reference to the Firestore collection for the user
      const userDocRef = firestore.collection('UserInfo').doc(accountID);

      // Fetch the user document from Firestore
      const userDoc = await userDocRef.get();

      // Check if the user exists
      if (!userDoc.exists) {
        console.log('User not found');
        return res.status(404).send({
          fulfillmentResponse: {
            messages: [
              { text: { text: ['User not found. Please check the account ID and try again.'] } },
            ],
          },
        });
      }

      console.log('User found. Updating appointment time.');

      // Update the appointment_time field in Firestore with the new appointment time
      await userDocRef.update({ appointment_time: newAppointmentTime });

      console.log('Appointment date updated successfully');
      return res.status(200).send({
        fulfillmentResponse: {
          messages: [
            { text: { text: ['Your appointment has been rescheduled successfully.'] } },
          ],
        },
      });
    }

  } catch (error) {
    // Log the error and return a server error response
    console.error('Error updating appointment date:', error);
    return res.status(500).send({
      fulfillmentResponse: {
        messages: [
          { text: { text: ['An internal server error occurred. Please try again later.'] } },
        ],
      },
    });
  }
};
