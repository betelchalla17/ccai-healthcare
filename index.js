const Firestore = require('@google-cloud/firestore');
const PROJECTID = 'my-project-ccao';
const firestore = new Firestore({
  projectId: PROJECTID,
});

exports.appointmentDetails = async (req, res) => {
  try {
    console.log('Dialogflow Request body:', JSON.stringify(req.body));

    const tag = req.body.fulfillmentInfo?.tag;
    console.log('Tag:', tag);

    // Get the accountID from query params
    //const accountID = req.query.accountID;
    const accountID = req.body.sessionInfo.parameters.account_id;
    console.log('Account ID fetched:', accountID);

    // Validate if accountID exists
    if (!accountID) {
      console.log('Missing account ID');
      return res.status(400).send({
        fulfillmentResponse: {
          messages: [
            { text: { text: ['Missing account ID. Please provide a valid ID.'] } },
          ],
        },
      });
    }

    if (tag === 'appointment-details') {
      console.log('Processing appointment details');

      // Reference the Firestore document
      const userRef = firestore.collection('UserInfo').doc(accountID);

      // Fetch the document
      const userDoc = await userRef.get();

      // Log the document details
      console.log('Fetched document:', userDoc);

      // Check if the document exists
      if (!userDoc.exists) {
        console.log('Document does not exist for the given account ID');
        return res.status(200).send({
          sessionInfo: { parameters: { valid: false } },
          fulfillmentResponse: {
            messages: [
              {
                text: {
                  text: [
                    'Sorry, we could not find any appointment details for the provided account ID.',
                  ],
                },
              },
            ],
          },
        });
      }

      // Safely access the document's data
      const userData = userDoc.data();
      if (!userData) {
        console.error('Document exists but contains no data');
        return res.status(500).send({
          fulfillmentResponse: {
            messages: [
              {
                text: {
                  text: [
                    'An internal error occurred. The document contains no data. Please contact support.',
                  ],
                },
              },
            ],
          },
        });
      }

      // Extract appointment details from the document
      // Safely access the appointment_time field (Firestore Timestamp)
const appointmentTime = userData.appointment_time.toDate(); // Convert Firestore Timestamp to JavaScript Date object

// Format the Date to a readable string (you can customize the format as needed)
const formattedAppointmentTime = appointmentTime.toLocaleString('en-US', {
  weekday: 'long', // 'Monday'
  year: 'numeric', // '2025'
  month: 'long', // 'January'
  day: 'numeric', // '24'
  hour: 'numeric', // '11'
  minute: 'numeric', // '30'
  second: 'numeric', // '00'
  hour12: true, // AM/PM format
});
      const userName = userData.name;

      if (!appointmentTime || !userName) {
        console.error('Incomplete user data: Missing appointment_time or name');
        return res.status(500).send({
          fulfillmentResponse: {
            messages: [
              {
                text: {
                  text: [
                    'An internal error occurred. Some user details are missing. Please contact support.',
                  ],
                },
              },
            ],
          },
        });
      }

      console.log('Appointment details fetched successfully:', appointmentTime);

      // Construct the response message
      const answer = `Hello ${userName}! Your appointment is scheduled for ${formattedAppointmentTime}.`;

      return res.status(200).send({
        sessionInfo: { parameters: { valid: true } },
        fulfillmentResponse: {
          messages: [{ text: { text: [answer] } }],
        },
      });
    }

    // Handle invalid tags
    console.log('Invalid tag received:', tag);
    return res.status(400).send({
      fulfillmentResponse: {
        messages: [{ text: { text: ['Invalid request.'] } }],
      },
    });
  } catch (error) {
    console.error('Error handling request:', error.message);
    return res.status(500).send({
      fulfillmentResponse: {
        messages: [
          { text: { text: ['An internal server error occurred. Please try again later.'] } },
        ],
      },
    });
  }
};
