const express = require('express');
const request = require('request');
const cheerio = require('cheerio');

const app = express();
const port = 7000;

function scrapeIPOSubscriptionStatus(url, callback) {
    request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);
            // Find the table element containing IPO subscription status
            const table = $('table.has-white-background-color');

            // Initialize arrays to store data from each row
              const headings = [];
              const rows = [];

              // Extract table headings
              headings.push('Status')
              table.find('thead tr th').each((index, element) => {
                headings.push($(element).text().trim());
              });
              
              
              // Extract table rows
              table.find('tbody tr').each((index, element) => {
                const row_data = [];
                $(element)
                .find('strong').first()
                  .each((i, el) => {
                    row_data.push($(el).text().trim());
                  });
                $(element)
                .find('td')
                  .each((i, el) => {
                      $(el).find('strong').remove().first().text().trim()
                    // const status = $(el).find('strong').first().text().trim();
                    row_data.push($(el).text().trim());
                  });
                
                rows.push(row_data);
              });

              // Combine headings and rows into an object
              const tableData = { headings, data: rows.map((space)=> space.filter(ele => ele != "")) };
              callback(null, tableData);
        } else {
            callback(error || new Error('Scraping failed. Please check the URL and try again.'));
        }
    });
}


// const url = 'https://ipowatch.in/ipo-subscription-status-numbers/';
//     scrapeIPOSubscriptionStatus(url, (error, tableData) => {
//         if (error) {
//             res.status(500).json({ error: error.message });
//         } else {
//             console.log(tableData);
//         }
//     });
app.get('/ipolist', (req, res) => {
    const url = 'https://ipowatch.in/ipo-subscription-status-numbers/';
    scrapeIPOSubscriptionStatus(url, (error, tableData) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.json(tableData);
        }
    });
});

app.get('/',(req,res)=>{
  res.status(200).json('api working good')
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
