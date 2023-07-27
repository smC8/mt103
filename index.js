const Swift = require('swift-mock');
const express = require('express');
const bodyParser = require('body-parser');
const swift = new Swift({ in: './in', out: './out', fieldPatterns: './patterns.json', logLevel: 2 });
const { v4: uuidv4 } = require('uuid');

// const fs = require('fs');
// const file = fs.readFileSync('./in/mt103.fin', { encoding: 'UTF-8' });
// const ast = swift.parse(file)
// console.log(ast)
 
const app = express();
const port = 3000; // You can change the port number if needed

// Parse incoming JSON data
app.use(bodyParser.json());


// Function to generate a random N-digit integer and left-pad it with zeros if needed
function generateRandomNumber(digits) {
    const randomNumber = Math.floor(Math.random() * (10 ** digits));
    return randomNumber.toString().padStart(digits, '0');
  }

// Generate a UUIDv4
const uuid = uuidv4();

// POST route to handle incoming data
app.post('/api/v1/data', (req, res) => {
  try {
    // Access the data sent in the request body
    const requestData = req.body;
    console.log(requestData)

    // You can process the requestData here (e.g., save to a database, perform some calculations)
const message = swift.generate([
    {
      block: 1, data: {
        "applicationId": "F",
        "serviceId": "01",
        "receivingLtId": "RIBLSARIXXXX",
        "sessionNumber": generateRandomNumber(4),
        "sequenceNumber": generateRandomNumber(6)
      }
    },
    {
      block: 2, data: {
        "direction": "I",
        "msgType": "103",
        "bic": requestData.destinationAddressBic,
        "prio": "N2",
        "monitoringField": "2"
      }
    },
    {
      block: 3, data: {
        "108": generateRandomNumber(16),
        "121": uuidv4()
      }
    },
    {
      block: 4, data: [
          {
            "type": "20",
            "option": "",
            "fieldValue": ":"+requestData.sendersReference,
            "content": ":20:"+requestData.sendersReference
          },
          {
            "type": "23",
            "option": "B",
            "fieldValue": ":CRED",
            "content": ":23B:CRED"
          },
          {
            "type": "32",
            "option": "A",
            "fieldValue": ":"+requestData.date+requestData.settlementCurrency+requestData.settlementAmount,
            "content": ":32A:"+requestData.date+requestData.settlementCurrency+requestData.settlementAmount
          },
          {
            "type": "33",
            "option": "B",
            "fieldValue": ":"+requestData.instructedCurrency+requestData.instructedAmount,
            "content": ":33B:"+requestData.instructedCurrency+requestData.instructedAmount
          },
          {
            "type": "50",
            "option": "A",
            "fieldValue": ":RIBLSARIXXX",
            "content": ":50A:RIBLSARIXXX"
          },
          {
            "type": "59",
            "option": "",
            "fieldValue": ":/"+requestData.beneCustomerAccount+'\n'+ requestData.beneCustomerName+'\n'+requestData.beneCustomerAddressLine1+'\n'+requestData.beneCustomerAddressLine2+'\n'+requestData.beneCustomerAddressLine3,
            "content": ":59:/"+requestData.beneCustomerAccount+'\n'+ requestData.beneCustomerName+'\n'+requestData.beneCustomerAddressLine1+'\n'+requestData.beneCustomerAddressLine2+'\n'+requestData.beneCustomerAddressLine3
          },
          {
            "type": "71",
            "option": "A",
            "fieldValue": ":SHA",
            "content": ":71A:SHA"
          },
      ]
    }
    // ,
    // {
    //   block: 5, data: {
    //     "MAC": "00000000",
    //     "CHK": "11E37804E6A0"
    //   }
    // },
    // {
    //   block: 'S', data: {
    //     "SAC": undefined,
    //     "COP": "P"
    //   }
    // }
  ]);

  //console.log(message);


    // Send a response back to the client
//     res.json({ message: 'Data received successfully', data: message });
//   } catch (err) {
//     // If an error occurs, send an error response
//     res.status(500).json({ error: 'An error occurred while processing the data.' });
//   }
res.send(message);
  } catch (err) {
    // If an error occurs, send an error response
    res.status(500).send('An error occurred while processing the data.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
