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

  return (
    <main>
      <input type="date" min={"2022-10-27"} max={maxDate()} value={localDate.toISOString().split('T')[0]} onChange={(e) => setLocalDate(new Date(e.target.value))}></input>
      <label htmlFor="Region">Vælg landsdel</label>
      <select name="Region" onChange={({target:{value}}) => regionChange(value)}>
        <option value="DK2">Østdanmark</option>
        <option value="DK1">Vestdanmark</option>
      </select>
      <table>
          <tr>
              <th>
                  From
              </th>
              <th>
                  Rå pris
              </th>
              <th>
                  Pris med moms
              </th>
          </tr>

          {apiData.map((entry) => 
              <tr key={entry.time_start}>
                  <td>
                      {(entry.time_start.substring(0,2) > '05' && entry.time_start.substring(0,2) < '18') ? <i className="material-symbols-outlined">light_mode</i> : <i className="material-symbols-outlined">dark_mode</i>}
                      <i className="material-symbols-outlined"></i>
                      {entry.time_start}
                  </td>

                  <td>
                  {(entry.DKK_per_kWh.charAt(0) === '0' ? <p>{(entry.DKK_per_kWh*100).toFixed(2).replace('.',',').concat(' Øre')}</p> : <p>{(entry.DKK_per_kWh*1).toFixed(2).replace('.',',').concat(' Kr')}</p>)}
                  </td>

                  <td>
                      {((entry.DKK_per_kWh * 1.25).toString().charAt(0) === '0' ? <p>{((entry.DKK_per_kWh * 1.25)*100).toFixed(2).replace('.',',').concat(' Øre')}</p> : <p>{(entry.DKK_per_kWh * 1.25).toFixed(2).replace('.',',').concat(' Kr')}</p>)}
                  </td>
              </tr>
          )} 
      </table>
    </main>
  );
}

export default Charts;
