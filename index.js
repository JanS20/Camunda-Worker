import {ZBClient} from 'zeebe-node'
import {v4 as uuid} from 'uuid'
import {config} from 'dotenv'
import axios from 'axios'

const url = "http://localhost:3000/"

config()
const zbc = new ZBClient()

zbc.createWorker({
  taskType: "bonitaetspruefung",
  taskHandler: (job) => {
    console.log("Invoke REST call...");
    axios
      .get(url)
      .then((response) => {
        console.log("...finished. Complete Job...");
        const creditScore = response.data.creditScore;
        let result = false;
        if (creditScore >= 700) {
          result = true;
        }
        job.complete({ result: result }).then(() => {
        });
      })
      .catch((error) => {
        job.fail("Could not invoke REST API: " + error.message);
      });
  },
});

zbc.createWorker('risikobewertung', async (job) => {
  const { fahrzeugdaten, unfallhistorie } = job.variables;

  try {
    const response = await axios.post('http://localhost:3002/fahrzeuge', {
      fahrzeugdaten,
      unfallhistorie,
    });
    const risikoErgebnis = response.data;

    return job.complete({ risikoErgebnis });
  } catch (error) {
    return job.fail('Fehler bei der Risikobewertung.' + error);
  }
});

zbc.createWorker('bonitaetspruefung', async (job) => {
  const { kundeId } = job.variables;

  try {
    const response = await axios.get(`http://localhost:3001/kunden/${kundeId}`);
    const bonitaetErgebnis = response.data.creditScore;
    let result = false;
    if (creditScore >= 700) {
    result = true;
    }

    return job.complete({ bonitaetErgebnis });
  } catch (error) {
    return job.fail('Fehler bei der Bonitätsprüfung.' + error);
  }
});

