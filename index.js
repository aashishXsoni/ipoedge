// const express = require('express');
// const request = require('request');
// const cheerio = require('cheerio');

// const app = express();
const port = 5000;

// function scrapeIPOSubscriptionStatus(url, callback) {
//     request(url, (error, response, html) => {
//         if (!error && response.statusCode === 200) {
//             const $ = cheerio.load(html);
//             // Find the table element containing IPO subscription status
//             const table = $('table.has-white-background-color');

//             // Initialize arrays to store data from each row
//               const headings = [];
//               const rows = [];

//               // Extract table headings
//               headings.push('Status')
//               table.find('thead tr th').each((index, element) => {
//                 headings.push($(element).text().trim());
//               });


//               // Extract table rows
//               table.find('tbody tr').each((index, element) => {
//                 const row_data = [];
//                 $(element)
//                 .find('strong').first()
//                   .each((i, el) => {
//                     row_data.push($(el).text().trim());
//                   });
//                 $(element)
//                 .find('td')
//                   .each((i, el) => {
//                       $(el).find('strong').remove().first().text().trim()
//                     // const status = $(el).find('strong').first().text().trim();
//                     row_data.push($(el).text().trim());
//                   });

//                 rows.push(row_data);
//               });

//               // Combine headings and rows into an object
//               const tableData = { headings, data: rows.map((space)=> space.filter(ele => ele != "")) };
//               callback(null, tableData);
//         } else {
//             callback(error || new Error('Scraping failed. Please check the URL and try again.'));
//         }
//     });
// }


// // const url = 'https://ipowatch.in/ipo-subscription-status-numbers/';
// //     scrapeIPOSubscriptionStatus(url, (error, tableData) => {
// //         if (error) {
// //             res.status(500).json({ error: error.message });
// //         } else {
// //             console.log(tableData);
// //         }
// //     });
// app.get('/ipolist', (req, res) => {
//     const url = 'https://ipowatch.in/ipo-subscription-status-numbers/';
//     scrapeIPOSubscriptionStatus(url, (error, tableData) => {
//         if (error) {
//             res.status(500).json({ error: error.message });
//         } else {
//             res.json(tableData);
//         }
//     });
// });

// app.get('/',(req,res)=>{
//   res.status(200).json('api working good')
// })


const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.get('/scrape', async (req, res) => {
  try {
    const url = 'https://www.chittorgarh.com/report/ipo-subscription-status-live-bidding-from-bse-nse/21/';
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const scrapedData = {
      data: {
        thead: [],
        tbody: []
      }
    };

    // Extract table header
    $('table.table-bordered thead th').each((index, th) => {
      const headerText = $(th).find('a').text().trim();
      scrapedData.data.thead.push(headerText);
    });

    const rows = $('table.table-bordered tbody tr');

    rows.each((index, row) => {
      const rowData = [];
      const columns = $(row).find('td');

      const companyLink = $(columns[0]).find('a').attr('href');
      rowData.push(companyLink);
      rowData.push($(columns[0]).find('a').text().trim());

      for (let i = 1; i < columns.length; i++) {
        const columnHeader = scrapedData.data.thead[i];

        if (columnHeader === 'Name' || columnHeader === 'Email') {
          rowData.push($(columns[i]).text().trim());
        } else {
          rowData.push($(columns[i]).find('a').text().trim());
        }
      }

      scrapedData.data.tbody.push(rowData);
    });

    console.log(scrapedData);

    scrapedData.data.tbody = scrapedData.data.tbody.map((td) => td.filter((d) => d !== ''))
    scrapedData.data.thead = scrapedData.data.thead.filter(t => (t !== '') && (t !== "compare"))
    // console.log(scrapedData);
    return res.status(200).json(scrapedData)
  } catch (error) {
    console.error('Error scraping data:', error);
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
})

app.get('/',(req,res)=>{
  res.status(200).json('api working good')
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
