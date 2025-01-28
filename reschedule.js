const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'my-project-ccao';
const firestore = new Firestore({
  projectId: PROJECTID,
});

// Main function to handle appointment date update
exports.updateAppointmentDate = async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('Dialogflow Request body:', JSON.stringify(req.body));

    const tag = req.body.fulfillmentInfo?.tag;
    console.log('Tag:', tag);

    const accountID = req.body.sessionInfo.parameters.account_id; // Extract account_id from session parameters
    console.log('Account ID fetched:', accountID);

    // Check if the tag is 'appointment-reschedule' to process the reschedule request
    if (tag === 'appointment-reschedule') {
      console.log('Processing appointment reschedule');

      const newAppointmentDate = req.body.sessionInfo.parameters.new_appointment_date;
      console.log('New Appointment Date:', newAppointmentDate);

      // Reference to the user's document
      const userDocRef = firestore.collection('UserInfo').doc(accountID);
      const userDoc = await userDocRef.get();

      // Check if the user document exists
      if (!userDoc.exists) {
        console.log('User not found');
        return res.status(404).send({
          fulfillmentResponse: {
            messages: [
              { 
                text: { 
                  text: ['User not found. Please check the account ID and try again.'] 
                } 
              },
            ],
          },
        });
      }

      console.log('User found. Updating appointment date.');

      // Update the appointment date in Firestore
      await userDocRef.update({ appointment_date: newAppointmentDate });

      console.log('Appointment date updated successfully');
      return res.status(200).send({
        fulfillmentResponse: {
          messages: [
            { 
              text: { 
                text: ['Your appointment has been rescheduled successfully.'] 
              } 
            },
          ],
        },
      });
    }
  } catch (error) {
    // Handle errors and log them
    console.error('Error updating appointment date:', error);
    return res.status(500).send({
      fulfillmentResponse: {
        messages: [
          { 
            text: { 
              text: ['An internal server error occurred. Please try again later.'] 
            } 
          },
        ],
      },
    });
  }
};
