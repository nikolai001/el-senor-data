import { useState, useEffect } from 'react';
import './assets/scss/charts.scss';

let currentDate = new Date()

const sourceLink = 'https://www.elprisenligenu.dk/api/v1/prices/'

function setApi() {

  if (currentDate.getMonth() < 10 || currentDate.getDate < 10) {
    
    if (currentDate.getMonth() < 10 && currentDate.getDate() < 10 ) {
      let month =  '0' + (currentDate.getMonth()+1)
      let day = '0' + (currentDate.getDate())
      return sourceLink+currentDate.getFullYear() + '/' + month+'-'+day+'_'+'DK2'+'.json'
    }else if (currentDate.getMonth() < 10 && currentDate.getDate() >= 10) {
      let month =  '0' + (currentDate.getMonth()+1)
      return sourceLink+currentDate.getFullYear() + '/' + month+'-'+currentDate.getDate()+'_'+'DK2'+'.json'
    } else {
        let day = '0' + (currentDate.getDate())
        return sourceLink+currentDate.getFullYear() + '/' + currentDate.month+'-'+day+'_'+'DK2'+'.json'
    }
  }
  return sourceLink+currentDate.getFullYear() + '/' + currentDate.getMonth()+'-'+currentDate.getDate()+'_'+'DK2'+'.json'
}



function Charts() {
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(false)

    useEffect (() => {
        async function fetchData() {
            setLoading(true)
            let data = await fetch(setApi());
            data = await data.json();
            data.forEach(entry => entry.time_start = entry.time_start.substring(11,16))
            data.forEach(entry => entry.DKK_per_kWh = entry.DKK_per_kWh.toString().substring(0,5))
            setApiData(data)
            setLoading(false);
        }
        fetchData()
  },[])

  return (
    
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
                    {(entry.time_start.substring(0,2) > '05' && entry.time_start.substring(0,2) < '18') ? <i class="material-symbols-outlined">light_mode</i> : <i class="material-symbols-outlined">dark_mode</i>}
                    <i class="material-symbols-outlined"></i>
                    {entry.time_start}
                </td>

                <td>
                {(entry.DKK_per_kWh.includes('0.',0) ? <p>{(entry.DKK_per_kWh*100).toString().replace('.',',').concat(' Øre')}</p> : <p>{(entry.DKK_per_kWh).toString().replace('.',',').concat(' Kr')}</p>)}
                  {/* {(entry.DKK_per_kWh).replace('.',',').concat(' Kr')} */}
                </td>

                <td>
                    {/* {(entry.DKK_per_kWh * 1.25).toString().substring(0,5).replace('.',',').concat(' Kr')} */}
                    {((entry.DKK_per_kWh * 1.25).toString().includes('0.',0) ? <p>{((entry.DKK_per_kWh * 1.25)*100).toString().replace('.',',').concat(' Øre')}</p> : <p>{(entry.DKK_per_kWh).toString().replace('.',',').concat(' Kr')}</p>)}
                </td>
            </tr>
        )} 
    </table>
  );
}

export default Charts;
