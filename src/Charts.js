import { useState, useEffect } from 'react';
import './assets/scss/charts.scss';

const sourceLink = 'https://www.elprisenligenu.dk/api/v1/prices/'

function setApi(region, localDate) {
  let day = localDate.getDate() < 10 ? '0' + localDate.getDate() : localDate.getDate();
  let month = (localDate.getMonth() + 1) < 10 ? '0' + (localDate.getMonth() + 1) : (localDate.getMonth() + 1);

  return sourceLink + localDate.getFullYear() + '/' + month + '-' + day + '_' + region + '.json'
}



function Charts() {
  const [apiData, setApiData] = useState([]);
  const [VATPrices, setVAT] = useState([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('DK2');
  const [tarifs, setTarifs] = useState([]);
  const [localDate, setLocalDate] = useState(() => new Date());
  const [currentTarif, setCurrentTarif] = useState('')
  const [modalStatus, toggleModal] = useState(false)
  const [currentHours, setCurrentHours] = useState([])
  const [correctedNumber, setCorrectedNumber] = useState('')
  const [snackbarToggled, setSnackbarToggled] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [hours, setHours] = useState(() => {
    const initialHours = [];
    for (let i = 0; i < 24; i++) {
      const hour = String(i).padStart(2, '0') + ':00';
      initialHours.push(hour);
    }
    return initialHours;
  });
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      let data = await fetch(setApi(region, localDate));
      data = await data.json();
      data.forEach(entry => entry.time_start = entry.time_start.substring(11, 16))
      data.forEach(entry => entry.time_end = entry.time_end.substring(11, 16))
      data.forEach(entry => entry.DKK_per_kWh = entry.DKK_per_kWh.toString().substring(0, 5))
      setApiData(data)
      const updatedData = data.slice().map(item => ({ ...item }));
      updatedData.sort((a, b) => { const hourA = parseInt(a.time_start); const hourB = parseInt(b.time_start); return hourA - hourB; })

      if (VATPrices.length > 1) {
        for (let i = 0; i < updatedData.length; i++) {
          updatedData[i].DKK_per_kWh = parseFloat((updatedData[i].DKK_per_kWh))
          tarifs.forEach(element => {
            for (let usedHour = parseInt(element.hours[0].substring(0, 2)); usedHour <= parseInt(element.hours[1].substring(0, 2)); usedHour++) {
              if (parseInt(updatedData[i].time_start.substring(0, 2)) == usedHour) {
                updatedData[i].DKK_per_kWh = parseFloat((parseFloat(updatedData[i].DKK_per_kWh) + parseFloat(element.price) * 1.25))
              }
            }
          })
        }
      }
      setVAT(updatedData);
      setLoading(false);
    }
    fetchData()
  }, [region, localDate, tarifs])



  function prependLeadingZero(value) {
    return value.toString().length === 1 ? '0' + value : value;
  }

  function maxDate() {
    return new Date().getHours() < 13 ? new String(new Date().getFullYear().toString() + '-' + prependLeadingZero(new Date().getMonth() + 1).toString() + '-' + prependLeadingZero(new Date().getDate()).toString()) : new String(new Date().getFullYear().toString() + '-' + prependLeadingZero(new Date().getMonth() + 1).toString() + '-' + prependLeadingZero(new Date().getDate() + 1).toString());
  }

  const regionChange = (value) => {
    setRegion(value)
  }

  const isInRange = (freeHour) => {
    const [start, end] = currentHours;
    if (start && end) {
      const startHour = parseInt(start.substring(0, 2));
      const endHour = parseInt(end.substring(0, 2));
      const freeHourNumber = parseInt(freeHour.substring(0, 2));

      return freeHourNumber >= startHour && freeHourNumber <= endHour;
    }

    return false;
  };

  function createTarif() {
    setCurrentHours([])
    if (tarifs.length !== 0) {
      if (!currentTarif) {
        let lastId = tarifs[tarifs.length - 1].identifier
        let updatedTarifs = tarifs.map((element) => element)
        updatedTarifs.push({ identifier: lastId + 1 })
        setTarifs(updatedTarifs)
        setCurrentTarif(updatedTarifs[updatedTarifs.length - 1])
        return
      }
    }
    setTarifs([{ identifier: 0 }])
    setCurrentTarif({ identifier: 0 })
  }

  function closeTarif(tarif) {
    setCurrentHours([])
    if (tarif.submitted) {
      setCurrentTarif()
      setCorrectedNumber()
      toggleModal(false)
      return
    }
    setCurrentTarif()
    setCorrectedNumber()
    toggleModal(false)
    let updatedTarifs = tarifs.filter((element) => element.identifier !== tarif.identifier);
    setTarifs(updatedTarifs)
  }

  function submitTarif() {
    toggleModal(false)
    if ((currentHours && currentHours.length > 0) && (correctedNumber && correctedNumber.length > 0)) {
      setTarifs(prevTarifs => {
        const updatedTarifs = prevTarifs.map(tarif => {
          if (tarif.identifier === currentTarif.identifier) {
            return { ...tarif, price: correctedNumber, hours: currentHours };
          }
          return tarif;
        });
        const filteredTarifs = updatedTarifs.filter(tarif => tarif.identifier !== setCurrentTarif.setCurrentTarif || tarif === currentTarif);
        return filteredTarifs;
      });
      removeUsedHours(currentHours)
      setCorrectedNumber()
      setCurrentTarif()
    }
  }

  function removeUsedHours(currentHours) {
    let removedHours = []
    for (let hourIndex = parseInt(currentHours[0].substring(0, 2)); hourIndex <= parseInt(currentHours[1].substring(0, 2)); hourIndex++) {
      removedHours.push(hourIndex);
    }
    setHours(hours.filter((hour) => !removedHours.includes(parseInt(hour.substring(0, 2)))));
  }

  function deleteTarif(tarif) {

    let addedHours = []
    for (let hourIndex = parseInt(tarif.hours[0].substring(0, 2)); hourIndex <= parseInt(tarif.hours[1].substring(0, 2)); hourIndex++) {
      addedHours.push(hourIndex);
    }

    addedHours = addedHours.map(hour => hour.toString().length < 2 ? "0" + hour + ":00" : hour.toString().includes(':') ? hour : hour + ':00')
    let sortedHours = hours.concat(addedHours).sort((a, b) => {
      const hourA = parseInt(a.substring(0, 2));
      const hourB = parseInt(b.substring(0, 2));

      return hourA - hourB;;
    })

    setHours(sortedHours);

    let updatedTarifs = tarifs.filter((element) => element.identifier !== tarif.identifier);
    setTarifs(updatedTarifs)
  }

  function priceChange(value) {

    let correctedValue = value.replace(/,/g, ".");

    if (!isNaN(correctedValue)) {
      setCorrectedNumber(correctedValue)
    }
  }

  function selectRange(hour) {
    if (currentHours[0]) {
      if (hour > currentHours[0])
        setCurrentHours(Array(currentHours[0], hour))
      else {
        setCurrentHours(Array(hour, currentHours[0]))
      }
    } else {
      setCurrentHours(Array(hour))
    }
  }
  
  function copyToClipboard(state) {
    const data = [];
    document.querySelectorAll(".row__column--"+state).forEach(element => data.push(element.innerText));
    const excelData = data.join("\n");
    navigator.clipboard.writeText(excelData);
    setSnackbarToggled(true)
    setSnackbarMessage('Kopierede data')
    if (!snackbarToggled) {
      setTimeout(() => {
        setSnackbarToggled(false);
      }, 2000);
    }
  }


  

  function downloadData() {
    let downloadLink;
    let filename = localDate + '__' + region ? localDate + '__' + region + '.xls' : 'excel_data.xls';
    let dataType = 'data:text/plain;charset=utf-16le';
    let data = { 0: [], 1: [], 2: [] };
    document.querySelectorAll(".row__column--RAW").forEach(element => data[0].push(element.innerText));
    document.querySelectorAll(".row__column--VAT").forEach(element => data[1].push(element.innerText));
    document.querySelectorAll(".column--time-time").forEach(element => data[2].push(element.innerText));
  
    // Generate the file content
    let fileContent = '';
    let maxLength = Math.max(data[0].length, data[1].length, data[2].length);
    for (let i = 0; i < maxLength; i++) {
      let row = `${data[2][i] || ''}\t${data[0][i] || ''}\t${data[1][i] || ''}\n`;
      fileContent += row;
    }
  
    // Add BOM (Byte Order Mark) to indicate UTF-16 encoding
    let bom = new Uint8Array([0xFF, 0xFE]);
    let encodedContent = new Uint16Array(fileContent.length + 1);
    for (let i = 0; i < fileContent.length; i++) {
      encodedContent[i] = fileContent.charCodeAt(i);
    }
    encodedContent[fileContent.length] = 0xFFFD; // Add replacement character at the end
  
    // Combine BOM and encoded content
    let fileData = new Blob([bom, encodedContent], { type: dataType });
  
    // Create a URL for the Blob object
    let downloadUrl = URL.createObjectURL(fileData);
  
    // Create a download link element
    downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
  
    // Set the download link URL and file name
    downloadLink.href = downloadUrl;
    downloadLink.download = filename || 'excel_data.xls';
  
    // Trigger the download
    downloadLink.click();
    downloadLink.download = filename
  
    // Clean up the URL object
    URL.revokeObjectURL(downloadUrl);
    setSnackbarMessage('Downloader dokument')
    setSnackbarToggled(true);
    if (!snackbarToggled) {
      setTimeout(() => {
        setSnackbarToggled(false);
      }, 2000);
    }
  }
  
  
  
  


  return (
    <main className='chart'>
      <div className='chart__date'>
        <label className='date__label' htmlFor="Date">Vælg dato</label>
        <input name="Date" className='date__input input' type="date" min={"2022-10-27"} max={maxDate()} value={localDate.toISOString().split('T')[0]} onChange={(e) => setLocalDate(new Date(e.target.value))}></input>
      </div>

      <div className='chart__region'>
        <label className='region__label' htmlFor="Region">Vælg landsdel</label>
        <select className='region__picker input' name="Region" onChange={({ target: { value } }) => regionChange(value)}>
          <option className='picker__option' value="DK2">Østdanmark</option>
          <option className='picker__option' value="DK1">Vestdanmark</option>
        </select>
      </div>

      {tarifs.map((tarif) => (
        <div className={currentTarif && currentTarif.identifier === tarif.identifier ? 'chart__card' : 'chart__card chart__card--closed'} key={tarif.identifier}>
          {currentTarif && currentTarif.identifier === tarif.identifier && (<button className='card__button card__button--close material-symbols-outlined' onClick={() => closeTarif(tarif)}>close</button>)}
          {tarif.price ? (<p className='card__title'>{tarif.price} kr <br /> {tarif.hours[0]} - {tarif.hours[1]} </p>) : (<p className='card__title'>Ukategoriseret tarif</p>)}
          {currentTarif && currentTarif.identifier === tarif.identifier && (<input className='card__price' type="text" placeholder='Pris i kr/øre' onChange={({ target: { value } }) => priceChange(value)} value={correctedNumber} />)}
          {currentTarif && currentTarif.identifier === tarif.identifier && (
            <div>
              {currentHours[0] && currentHours[1] ? (
                <button className="card__time" onClick={() => toggleModal(!modalStatus)}>
                  {currentHours[0]} - {currentHours[1]}
                </button>
              ) : (
                <button className="card__time" onClick={() => toggleModal(!modalStatus)}>
                  Vælg tidspunkt
                </button>
              )}
            </div>
          )}
          {currentTarif && currentTarif.identifier === tarif.identifier ? (<button className='card__button card__button--submit material-symbols-outlined' onClick={() => submitTarif(tarif)}>check</button>) : (<button className='card__button card__button--submit material-symbols-outlined' onClick={() => deleteTarif(tarif)}>delete</button>)}
        </div>
      ))}

      {currentTarif && modalStatus && <div className='chart__hours'>
        {hours.map((freeHour) =>
          <button key={freeHour} className={isInRange(freeHour) ? 'hours__option hours__option--selected' : 'hours__option'} onClick={() => selectRange(freeHour)}>
            {freeHour}
          </button>
        )}
      </div>}

      {!currentTarif && <button className='chart__text-button' type='button' onClick={() => createTarif()}>Tilføj tarrif</button>}

      <article className='chart__table'>
        <div className='table__row'>
          <div className='row__head'>
            From
          </div>
          <div className='row__head'>
            Rå pris
          </div>
          <div className='row__head'>
            Pris med moms og tarrif
          </div>
        </div>

        {apiData.map((entry, index) =>
          <div className='table__row' key={entry.time_start}>
            <div className='row__column row__column--time'>
              <p className='column--time__text'>
                {entry.time_start.substring(0, 2) > '05' && entry.time_start.substring(0, 2) < '18' ? (
                  <i className="material-symbols-outlined column--time__symbol column--time__symbol--light">light_mode</i>
                ) : (
                  <i className="material-symbols-outlined column--time__symbol column--time__symbol--dark">dark_mode</i>
                )}
                <span className='column--time-time'>{entry.time_start}</span>
              </p>
            </div>

            <div className='row__column row__column--RAW'>
              {entry.DKK_per_kWh.charAt(0) === '0' ? (
                <p>{parseFloat((entry.DKK_per_kWh * 100)).toFixed(2).replace('.', ',').concat(' Øre')}</p>
              ) : (
                <p>{parseFloat((entry.DKK_per_kWh * 1)).toFixed(2).replace('.', ',').concat(' Kr')}</p>
              )}
            </div>

            <div className='row__column row__column--VAT'>
              {VATPrices[index] && (
                <p>
                  {VATPrices[index].DKK_per_kWh.toString().charAt(0) === '0' ? (
                    <>{parseFloat((VATPrices[index].DKK_per_kWh * 100)).toFixed(2).replace('.', ',').concat(' Øre')}</>
                  ) : (
                    <>{parseFloat((VATPrices[index].DKK_per_kWh)).toFixed(2).replace('.', ',').concat(' Kr')}</>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="table__button-holder">
          <button className="button-holder__button--copy input" onClick={() => copyToClipboard("RAW")}>Kopier rå data</button>
          <button className="button-holder__button--copy input" onClick={() => copyToClipboard("VAT")}>Kopier data med afgifter</button>
          <button className="button-holder__button--download input" onClick={() => downloadData()}>Download data som excel</button>
        </div>
      </article>
      <div className={snackbarToggled ? 'chart__snackbar chart__snackbar--active': 'chart__snackbar'}>
        <span className='snackbar__text'>{snackbarMessage}</span> <span className='snackbar__icon material-symbols-outlined'>content_copy</span>
      </div>
    </main>
  );
}

export default Charts;
