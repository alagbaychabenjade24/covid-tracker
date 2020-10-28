import React, { useState, useEffect } from 'react';
import {
    MenuItem,
    FormControl,
    Select,
    Card,
    CardContent
} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map';
import Table from './Table';
import { prettyPrintStat, sortData } from './util';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

import './App.css';

function App() {
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState('worldwide');
    const [countryInfo, setCountryInfo] = useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState({
        lat: 34.80746,
        lng: -40.4796
    });
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState('cases');

    useEffect(() => {
        fetch('https://disease.sh/v3/covid-19/all')
            .then(response => response.json())
            .then(data => {
                setCountryInfo(data);
            });
    }, []);

    useEffect(() => {
        const getCountriesData = async () => {
            fetch('https://disease.sh/v3/covid-19/countries')
                .then(response => response.json())
                .then(data => {
                    const countries = data.map(country => ({
                        name: country.country,
                        value: country.countryInfo.iso2,
                        flag: country.countryInfo.flag
                    }));

                    const sortedData = sortData(data);
                    setTableData(sortedData);
                    setMapCountries(data);
                    setCountries(countries);
                });
        };

        getCountriesData();
    }, []);

    const onCountryChange = async event => {
        const countryCode = event.target.value;

        const url =
            countryCode === 'worldwide'
                ? 'https://disease.sh/v3/covid-19/all'
                : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

        await fetch(url)
            .then(response => response.json())
            .then(data => {
                setCountry(countryCode);
                setCountryInfo(data);

                setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
                setMapZoom(4);
            });
    };

    console.log(countryInfo);

    return (
        <div className='app'>
            <section className='app__left'>
                <div className='app__header'>
                    <h1>COVID-19 TRACKER</h1>
                    <FormControl className='app__dropdown'>
                        <Select
                            variant='outlined'
                            value={country}
                            onChange={onCountryChange}
                        >
                            {/* Loop through all the countries and show a dropdown list of the options */}

                            <MenuItem value='worldwide'>
                                <img
                                    src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAARVBMVEUAAABChfRChfRBhfRChfRBhPVAhvVBhfRChfRChPRBhfNChPRChfNChPRAh/dAhfRChfNBhPRBhPNBhPRBhPNAhfRBhPS7Bx6gAAAAF3RSTlMAYJ/P/09Q35DgwI/wcCAwgKCw0O9vv5uoiNwAAACdSURBVHgBndAFFsJAEATRhhQrcb//UXmDS/yvu+i40zmB5HzRN+d58E4fAsRImlpO9tmfFyWUloqc8NqHvFJNI7UUquC5W6SQOms6EqnAP+7DHyfT8KeR6aik+n5ksF0rEhmQDdR6FTA/MLNVN3/43HX/H9hJBfH1JX2l4vklDpweAv3w+kQIX9/uPWNqOUEfXOQhOn1zTQdd43TYFdiMB87SSSztAAAAAElFTkSuQmCC'
                                    alt='worldwide'
                                    className='country__flag'
                                />
                                Worldwide
                            </MenuItem>
                            {countries.map(country => (
                                <MenuItem value={country.value}>
                                    <img
                                        src={country.flag}
                                        alt={country.value}
                                        className='country__flag'
                                    />
                                    {country.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div className='app__stats'>
                    <InfoBox
                        isRed
                        active={casesType === 'cases'}
                        onClick={e => setCasesType('cases')}
                        title='Coronavirus Cases'
                        cases={prettyPrintStat(countryInfo.todayCases)}
                        total={prettyPrintStat(countryInfo.cases)}
                    />

                    <InfoBox
                        active={casesType === 'recovered'}
                        onClick={e => setCasesType('recovered')}
                        title='Recovered'
                        cases={prettyPrintStat(countryInfo.todayRecovered)}
                        total={prettyPrintStat(countryInfo.recovered)}
                    />

                    <InfoBox
                        isRed
                        active={casesType === 'deaths'}
                        onClick={e => setCasesType('deaths')}
                        title='Deaths'
                        cases={prettyPrintStat(countryInfo.todayDeaths)}
                        total={prettyPrintStat(countryInfo.deaths)}
                    />
                </div>

                <Map
                    casesType={casesType}
                    countries={mapCountries}
                    center={mapCenter}
                    zoom={mapZoom}
                />
            </section>

            <Card className='app__right'>
                <CardContent>
                    <h3>Live Cases by Country</h3>
                    <Table countries={tableData} />

                    <h3 className='app__graphTitle'>
                        Worldwide new {casesType}
                    </h3>
                    <LineGraph className='app__graph' casesType={casesType} />
                </CardContent>
            </Card>
        </div>
    );
}

export default App;
