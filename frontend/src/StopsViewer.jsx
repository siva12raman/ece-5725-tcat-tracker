import React, { useState, useEffect } from 'react';
import './StopsViewer.css'; // Create a CSS file for styles
import NotificationButton from './NotificationButton';
import { Page, Toolbar, Button, List, ListItem, Select } from 'react-onsenui';
import StopsViewerGraph from './StopsGraph';
function StopsViewer() {
  const fetch_interval = 10000;
  const [stops, setStops] = useState([]);
  const [busLocation, setBusLocation] = useState([]);
  const [status, setStatus] = useState('Select a route');
  const [fetchStatus, setFetchStatus] = useState('Select a route');
  const [selectedRoute, setSelectedRoute] = useState('');

  const fetchStops = async (routeId) => {
    if (!routeId) return;

    setStatus('Fetching stops...');
    const apiUrl = `/api/v2/stops/${routeId}`;

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.status === 'success') {
        console.log(result.data.stops);
        if(!!!result.data.stops){
          setStops([]);
          setStatus('No Running vehicles currently');
        } else {
          setStops(result.data.stops);
          setStatus('Stops fetched successfully.');
        }
      } else {
        setStatus('Error fetching stops.');
        console.error('API Error:', result.message);
      }
    } catch (error) {
      setStatus('Error fetching stops.');
      console.error('Fetch Error:', error);
    }
  };

  const fetchLocation = async (routeId) => {
    if (!routeId) return;

    setFetchStatus('Fetching ...')

    const apiUrl = `/api/vehicles/${routeId}`;

    try {
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (result.status === 'success') {
        let incoming_stops = result.data.map((res) => res['incoming_stop']);
        setBusLocation(incoming_stops || []);
        setFetchStatus('Fetched')
      } else {
        console.error('API Error:', result.message);
        setFetchStatus('Error! Unable to sync');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setFetchStatus('Error! Unable to sync');

    }
  };

  useEffect(() => {
    if (selectedRoute) {
      fetchStops(selectedRoute);
      fetchLocation(selectedRoute);

      const intervalId = setInterval(() => fetchStops(selectedRoute), fetch_interval);
      return () => clearInterval(intervalId);
    } else {
      setStops([]);
      setBusLocation([]);
    }
  }, [selectedRoute]);

  const handleRouteChange = (event) => {
    setSelectedRoute(event.target.value);
  };

  const getClassName = (stop) => {
    if (!!!stop) { return 'hide' };
    return stop['is_incoming'] ? 'incoming' : 'not-incoming';

  };

  return (
    <Page>
      {/* Top Toolbar */}
      <Toolbar>
        <div className="center">TCAT Tracker</div>
      </Toolbar>

      {/* Main Content */}
      <div style={{ marginTop: '2rem', padding: '16px' }}>
        {/* Route Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '2rem' }}>
          {/* Route Selector */}
          <Select
            value={selectedRoute}
            onChange={handleRouteChange}
            style={{ flex: 1, marginRight: '8px' }} // Flex-grow for Select and spacing
          >
            <option value="">Select Route</option>
            <option value="30">Route 30</option>
            <option value="81">Route 81</option>
            <option value="90">Route 90</option>
            <option value="10">Route 10</option>
          </Select>

          {/* Notify Button */}
          <NotificationButton></NotificationButton>
        </div>

        {/* Live Location Status */}
        <p style={{ marginTop: '16px', textAlign: 'center' }}>Live location: {status}</p>


        <div>
          <StopsViewerGraph numPoints={stops.length} stops={stops} busLocation={busLocation} />
        </div>

        {/* Stops List */}
        <div style={{ height: '10vw', overflow: 'auto' }}>
          <List
            dataSource={stops}
            renderRow={(stop, index) => (
              <ListItem key={index} className={getClassName(stop)}>
                <span style={{ fontWeight: stop.is_incoming ? 'bold' : 'normal' }}>
                  {stop.stop_name}
                </span>
              </ListItem>
            )}
          >
            {stops.length === 0 && status === 'Select a route' && (
              <ListItem>No stops available. Select a route for More Details</ListItem>
            )}
          </List>
        </div>

      </div>
    </Page>
  );
}

export default StopsViewer;