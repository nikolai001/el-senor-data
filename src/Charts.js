import { useState, useEffect } from 'react';

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
                Price
            </th>
        </tr>

        {apiData.map((entry) => 
            <tr>
                <td>
                    {entry.time_start}
                </td>

                <td>
                    {entry.DKK_per_kWh + ' Kr'}
                </td>
            </tr>
        )} 
    </table>
  );
}

export default Charts;
