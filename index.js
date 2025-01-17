import {ZBClient} from 'zeebe-node'
import {config} from 'dotenv'
import axios from 'axios'

const url = "http://localhost:3000/"

config()
const zbc = new ZBClient()

zbc.createWorker({
  taskType: "bonitaetspruefung",
  taskHandler: (job) => {
    console.log("Bonitaetspruefung gestartet...");
    axios
      .get(url)
      .then((response) => {
        console.log("Bonitaetspruefung fertig.");
        const bonitaet = response.data.bonitaet;
        let result = false;
        if (bonitaet >= 700) {
          result = true;
        }
        job.complete({ result: result }).then(() => {
        });
      })
      .catch((error) => {
        job.fail("Error: " + error.message);
      });
  },
});

zbc.createWorker({
  taskType: "risikopruefung",
  taskHandler: (job) => {
    console.log("Risikopruefung gestartet...");

    const { fahrzeugdaten, unfallhistorie } = job.variables;

    if (!fahrzeugdaten || !unfallhistorie) {
      console.error('Fehlende Fahrzeugdaten oder Unfallhistorie!');
      job.fail('Fahrzeugdaten oder Unfallhistorie fehlen.');
      return;
    }

    try {
      const response = axios.get(RISK_CHECK_URL, {
        params: { fahrzeugdaten, unfallhistorie },
      });

      console.log('Risikoprüfung abgeschlossen.');

      const risiko = response.data.risiko;

      let risikoKategorie = 'low';
      if (risiko >= 700) {
        risikoKategorie = 'high';
      } else if (risiko >= 400) {
        risikoKategorie = 'medium';
      }

      console.log(`Ergebnis der Risikoprüfung: ${risikoKategorie}`);

      job.complete({
        risikoKategorie,
      });

    } catch (error) {
      console.error('Fehler bei der Risikoprüfung:', error.message);
      job.fail('Fehler bei der Risikoprüfung: ' + error.message);
    }
  },
});

zbc.createWorker({
    taskType: 'antragStellen',
    taskHandler: async (job) => {

        console.log('Antrag versendet');

        try {
          await zbc.publishMessage({
            name: 'antragStellen',
            variables: { initialProcessVariable: 'Application received' }
          });
        
        } catch (err) {
          console.error('Error:', err);
        }
      
        await job.complete();
    },
});

zbc.createWorker({
  taskType: 'kundeKontaktieren',
  taskHandler: async (job) => {

      console.log('Kunde kontaktiert');

      try {
        await zbc.publishMessage({
          correlationKey: 'nachfragenDaten',
          name: 'kundeKontaktieren',
          variables: { initialProcessVariable: 'Application received' }
        });
        
      } catch (err) {
        console.error('Error:', err);
      }
    
      await job.complete();
  },
});

zbc.createWorker({
  taskType: 'fehlendeDaten',
  taskHandler: async (job) => {

      console.log('fehlende Daten');

      try {
        await zbc.publishMessage({
          correlationKey: 'antragId',
          name: 'fehlendeDaten',
          variables: { initialProcessVariable: 'Application received' }
        });
        
      } catch (err) {
        console.error('Error:', err);
      }
    
      await job.complete();
  },
});

zbc.createWorker({
  taskType: 'abbruch',
  taskHandler: async (job) => {

      console.log('Abgebrochen');

      try {
        await zbc.publishMessage({
          correlationKey: 'abbruch',
          name: 'abbruch',
          variables: { initialProcessVariable: 'Application received' }
        });
        
        console.log('Message sent to the Verification pool.');
      } catch (err) {
        console.error('Error:', err);
      }
    
      await job.complete();
  },
});

zbc.createWorker({
  taskType: 'absage',
  taskHandler: async (job) => {

      console.log('Abgesagt');

      try {
        await zbc.publishMessage({
          correlationKey: 'absage',
          name: 'absage',
          variables: { initialProcessVariable: 'Application received' }
        });
        
        console.log('Message sent to the Verification pool.');
      } catch (err) {
        console.error('Error:', err);
      }
    
      await job.complete();
  },
});

zbc.createWorker({
  taskType: 'zusage',
  taskHandler: async (job) => {

      console.log('Zugesagt');

      try {
        await zbc.publishMessage({
          correlationKey: 'zusage',
          name: 'zusage',
          variables: { initialProcessVariable: 'Application received' }
        });
        
      } catch (err) {
        console.error('Error:', err);
      }
    
      await job.complete();
  },
});