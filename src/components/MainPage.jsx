/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import './MainPage.css';
import Card from './Card.jsx';  


// Images
import imgOne from '../imgs/sunrise.png';
import imgTwo from '../imgs/sun.png';
import imgThree from '../imgs/fog.png';
import imgFour from '../imgs/sunset.png';
import imgFive from '../imgs/half-moon.png';
import cities from '../cities';

// console.log('hello')
// ${VM91:1} hello
// undefined

const MainPage = () => {
  const [data, setData] = useState(null);
  const [date, setDate] = useState('');
  const [dateNow, setDateNow] = useState('');
  const [city, setCity] = useState(cities[0]);
  const [timingByCity, setTimingByCity] = useState(new Map());
  const [timeZone, setTimeZone] = useState([]);
  const [diff, setDiff] = useState('');

  function updateHour(date) {
    if (date) {
      let splitDate = date.split(':');
      let afterEdit;
      splitDate.forEach((item, index) => {
        if (index === 0) {
          if (+item > 12) {
            afterEdit = item - 12;
          } else {
            afterEdit = item;
          }
        } else {
          afterEdit += `:${item}`;
        }
      })
      return `${afterEdit}`;
    }
  }

  function addZeroToDate(date) {
    if (date) {
      let splitArr = date.split(':');
      if (splitArr[2]) return `${splitArr[0].toString().padStart(2, '0')}:${splitArr[1].toString().padStart(2, '0')}:${splitArr[2].toString().padStart(2, '0')}`;
      else return `${splitArr[0].toString().padStart(2, '0')}:${splitArr[1].toString().padStart(2, '0')}`;
    }
  }

  function toSeconds(time) {
    let splitTime = time.split(':');
    return splitTime[0] * 3600 + splitTime[1] * 60 + +splitTime[2];
  }

  function fromSeconds(secs) {
    const hours = parseInt(secs / 3600),
      seconds = parseInt(secs % 3600),
      minutes = parseInt(seconds / 60),
      secondsShow = parseInt(seconds % 60);
    
    return `${hours}:${minutes}:${secondsShow}`;
  }

  function slicesOfArr(date, num) {
    return date.split(':')[num];
  }

  // To fetch
  useEffect(() => {
    (async () => {
      const request = await fetch(`https://api.aladhan.com/v1/timingsByCity?country=${city.country}&city=${city.nameEn}`);
      const response = await request.json();
      const timePrayers = response.data.timings;
      setData(response);
      setTimingByCity(new Map(
        timingByCity.set('Fajr', [timePrayers.Fajr, 'الفجر']),
        timingByCity.set('Dhuhr', [timePrayers.Dhuhr, 'الظهر']),
        timingByCity.set('Asr', [timePrayers.Asr, 'العصر']),
        timingByCity.set('Maghrib', [timePrayers.Maghrib, 'المغرب']),
        timingByCity.set('Isha', [timePrayers.Isha, 'العشاء']),
      ));
    })()
  }, [city]);

  // To Add Hijri
  useEffect(() => {
    if (data) {
      const hijri = data.data.date.hijri;
      setDate(`${hijri.weekday.ar} ${hijri.day} ${hijri.month.ar} ${hijri.year} ھ`);
    }
  }, [data])

  // To Add DateNow
  useEffect(() => {
    const dateNow = new Date();
    setDateNow(addZeroToDate(`${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`));
    const interval = setInterval(() => {
      const dateNow = new Date();
      setDateNow(addZeroToDate(`${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Diff to prayers
  useEffect(() => {
    if (timingByCity.size && Array.isArray(timeZone) && timeZone.length) {
      let sTime = dateNow;
      let eTime = `${timeZone[0]}:00`;

      if (sTime && eTime) {
        let diff = toSeconds(eTime) - toSeconds(sTime);
        if (diff < 0) diff = 86400 + diff;
        setDiff(addZeroToDate(fromSeconds(diff)));
      }
    }
  }, [dateNow]);

  useEffect(() => {
    let count = 0;
    for (let [key, value] of timingByCity) {
      if (+slicesOfArr(value[0], 0) > +slicesOfArr(dateNow, 0) || (+slicesOfArr(value[0], 0) === +slicesOfArr(dateNow, 0) && +slicesOfArr(value[0], 1) >= +slicesOfArr(dateNow, 1))) {
        setTimeZone(timingByCity.get(key));
        count += 1;
        break;
      }
    }
    
    if (!count) {
      setTimeZone(timingByCity.get('Fajr'));
    }
  }, [dateNow]);

  return (
    <div className='container pt-5 pb-3'>
      <h1 className='text-light mb-5 fw-300'>مواقيت الصلاة</h1>
      <div className="text-light gap-3 city-component row align-items-center">
        <div className='col-md-3 col-sm-12'>
          <div className="city">{city.nameAr}</div>
          <div className="date">{date ? date : 'Loading...'}</div>
        </div>

        <div className='col-md-2 col-sm-12 d-flex flex-column gap-2'>
          <select className="form-select" aria-label="Default select example" onChange={(e) => setCity(cities[+e.target.value])}>
            {cities.map((city, index) => <option value={index} key={city.nameEn}>{city.nameAr}</option>)}
          </select>
        </div>
      </div>

      <div className="clock-to-prayers mt-5 text-light">
        <div className="clock-now">الساعة الأن {dateNow ? addZeroToDate(updateHour(dateNow)) : 'Loading... '}</div>
        <div className="about">باقى على  <span style={{color: '#86b7fe'}}>{Array.isArray(timeZone) && timeZone.length ? timeZone[1] : 'Loading...'}</span></div>
        <div className='clock-will d-flex align-items-center gap-1 mt-2'>
          <div className="clock seconds">{diff ? slicesOfArr(diff, 2) : '00'}</div>
          <span>:</span>
          <div className="clock minutes">{diff ? slicesOfArr(diff, 1) : '00'}</div>
          <span>:</span>
          <div className="clock hours">{diff ? slicesOfArr(diff, 0) : '00'}</div> 
        </div>
      </div>

      <div className="cards gap-3 mt-5">
        <Card time= {timingByCity.size ? addZeroToDate(updateHour(timingByCity.get('Fajr')[0])) : '00:00'} title= "الفجر" src= {imgOne}/>
        <Card time= {timingByCity.size ? addZeroToDate(updateHour(timingByCity.get('Dhuhr')[0])) : '00:00'} title= "الظهر" src= {imgTwo}/>
        <Card time= {timingByCity.size ? addZeroToDate(updateHour(timingByCity.get('Asr')[0])) : '00:00'} title= "العصر" src= {imgThree}/>
        <Card time= {timingByCity.size ? addZeroToDate(updateHour(timingByCity.get('Maghrib')[0])) : '00:00'} title= "المغرب" src= {imgFour}/>
        <Card time= {timingByCity.size ? addZeroToDate(updateHour(timingByCity.get('Isha')[0])) : '00:00'} title= "العشاء" src= {imgFive}/>
      </div>
    </div>
  );
}

export default MainPage;