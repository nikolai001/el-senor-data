import { useState, useEffect } from 'react';
import './assets/scss/charts.scss';

const sourceLink = 'https://www.elprisenligenu.dk/api/v1/prices/'

function setApi(region, localDate) {
  let day = localDate.getDate() < 10 ? '0' + localDate.getDate() : localDate.getDate();
  let month = (localDate.getMonth()+1) < 10 ? '0' + (localDate.getMonth()+1) : (localDate.getMonth()+1);

  return sourceLink+localDate.getFullYear() + '/' +month+'-'+day+'_'+region+'.json'
}



function Charts() {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState('DK2');
  const [tarifs, setTarifs] = useState([]);
  const [localDate, setLocalDate] = useState(() => new Date());
    useEffect (() => {
        async function fetchData() {
            setLoading(true)
            let data = await fetch(setApi(region,localDate));
            data = await data.json();
            data.forEach(entry => entry.time_start = entry.time_start.substring(11,16))
            data.forEach(entry => entry.DKK_per_kWh = entry.DKK_per_kWh.toString().substring(0,5))
            setApiData(data)
            setLoading(false);
        }
        fetchData()
  },[region,localDate])
  
  function prependLeadingZero(value) {
    return value.toString().length === 1 ? '0' + value : value;
  }

  function maxDate () {
    return new Date().getHours() < 13 ? new String(new Date().getFullYear().toString()+'-'+prependLeadingZero(new Date().getMonth()+1).toString()+'-'+prependLeadingZero(new Date().getDate()).toString()) : new String(new Date().getFullYear().toString()+'-'+prependLeadingZero(new Date().getMonth()+1).toString()+'-'+prependLeadingZero(new Date().getDate()+1).toString());
  }

  const regionChange = (value) => {
    setRegion(value)
  }

  const updateTarif = (value, identifier) => {
    if (tarifs.length !== 0) {
      let updatedTarifs = tarifs.map((element) => {
        if (element.identifier === identifier) {
          return { ...element, value: value };
        }
        return element;
      });
  
      let existingElement = updatedTarifs.find(
        (element) => element.identifier === identifier
      );
  
      if (!existingElement) {
        updatedTarifs.push({ identifier: identifier, value: value });
      }

      setTarifs(updatedTarifs);
    } else {
      setTarifs([{ identifier, value }]);
    }
  };
  
  

  return (
    <main className='chart'>
      
      <div className='chart__date'>
        <label className='date__label' htmlFor="Date">Vælg dato</label>
        <input name="Date" className='date__input input' type="date" min={"2022-10-27"} max={maxDate()} value={localDate.toISOString().split('T')[0]} onChange={(e) => setLocalDate(new Date(e.target.value))}></input>
      </div>
      
      {tarifs.map((element) => 
        <div key={element.identifier}>{element.value + ' ' + element.identifier}</div>
      )}

      <div className='chart__region'>
        <label className='region__label' htmlFor="Region">Vælg landsdel</label>
        <select className='region__picker input' name="Region" onChange={({target:{value}}) => regionChange(value)}>
          <option className='picker__option' value="DK2">Østdanmark</option>
          <option className='picker__option' value="DK1">Vestdanmark</option>
        </select>

        <label className='region__label' htmlFor='Tarrif-early'>Tarrif mellem 07:00 og 12:00</label>
        <input className='region__tarrif input' type='number' name="Tarrif-early" defaultValue='0' step='0.1' onChange={({target:{value}}) => updateTarif(value, 'Tarrif-early')}></input>

        <label className='region__label' htmlFor='Tarrif-middle'>Tarrif mellem 12:00 og 17:00</label>
        <input className='region__tarrif input' type='number' name="Tarrif-middle" defaultValue='0' step='0.1' onChange={({target:{value}}) => updateTarif(value, 'Tarrif-mid')}></input>

        <label className='region__label' htmlFor='Tarrif-late'>Tarrif mellem 17:00 og 24:00</label>
        <input className='region__tarrif input' type='number' name="Tarrif-late" defaultValue='0' step='0.1' onChange={({target:{value}}) => updateTarif(value, 'Tarrif-late')}></input>
      </div>

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

          {apiData.map((entry) => 
              <div className='table__row' key={entry.time_start}>
                  <div className='row__column row__column--time'>
                      <p className='column--time__text'>{(entry.time_start.substring(0,2) > '05' && entry.time_start.substring(0,2) < '18') ? <i className="material-symbols-outlined column--time__symbol column--time__symbol--light">light_mode</i> : <i className="material-symbols-outlined column--time__symbol column--time__symbol--dark">dark_mode</i>}
                     <span className='column--time-time'>{entry.time_start}</span></p>
                  </div>

                  <div className='row__column'>
                  {(entry.DKK_per_kWh.charAt(0) === '0' ? <p>{(entry.DKK_per_kWh*100).toFixed(2).replace('.',',').concat(' Øre')}</p> : <p>{(entry.DKK_per_kWh*1).toFixed(2).replace('.',',').concat(' Kr')}</p>)}
                  </div>

                  <div className='row__column'>
                      {((entry.DKK_per_kWh * 1.25).toString().charAt(0) === '0' ? <p>{((entry.DKK_per_kWh * 1.25)*100).toFixed(2).replace('.',',').concat(' Øre')}</p> : <p>{(entry.DKK_per_kWh * 1.25).toFixed(2).replace('.',',').concat(' Kr')}</p>)}
                  </div>
              </div>
          )} 
      </article>
    </main>
  );
}

export default Charts;
