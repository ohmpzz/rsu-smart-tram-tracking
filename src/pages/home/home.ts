import { Component, ViewChild, ElementRef } from '@angular/core';

import { NavController } from 'ionic-angular';

import { Geolocation } from '@ionic-native/geolocation';

import { AngularFirestore } from 'angularfire2/firestore';

import { map } from 'rxjs/operators';

declare var google;

interface BusStop {
  id?: string;

  coords?: any[];

  stopName?: string;
}

@Component({
  selector: 'page-home',

  templateUrl: 'home.html',
})
export class HomePage {
  @ViewChild('map')
  mapElement: ElementRef;

  map: any;

  x: number;
  y: number;

  tab1 = false;

  tab2 = false;

  tab3 = false;

  busStops: BusStop[];

  test: BusStop;

  constructor(
    private afs: AngularFirestore,
    public navCtrl: NavController,
    public geolocation: Geolocation
  ) {}

  async ionViewDidLoad() {
    await this.loadMap();

    this.getBusStops().subscribe((stop: BusStop[]) => {
      if (stop) {
        stop.forEach(s => {
          this.addMarker(+s.coords[0], +s.coords[1], s.stopName);
        });
      }
    });
  }

  getBusStops() {
    return this.afs
      .collection<BusStop>('busStops')
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            return {
              id: a.payload.doc.id,
              ...(a.payload.doc.data() as BusStop),
            };
          });
        })
      );
  }

  loadMap() {
    return new Promise((resolve, reject) => {
      //watchPosition
      this.geolocation.getCurrentPosition().then(
        position => {
          const { latitude, longitude } = position.coords;

          let latLng = new google.maps.LatLng(
            position.coords.latitude,

            position.coords.longitude
          );

          let mapOptions = {
            center: latLng,

            zoom: 15,

            mapTypeId: google.maps.MapTypeId.ROADMAP,
          };

          this.map = new google.maps.Map(
            this.mapElement.nativeElement,

            mapOptions
          );

          // this.addMarker(latitude, longitude, 'You are here');
          this.addMapLine();
          resolve();
        },

        err => {
          console.log(err);

          reject(err);
        }
      );
    });
  }
  addMapLine() {
    const mapLineCoords = [
      { lat: 13.96585, lng: 100.587298 },
      { lat: 13.964558, lng: 100.587601 },
      { lat: 13.964346, lng: 100.587616 },
      { lat: 13.964184, lng: 100.587539 },
      { lat: 13.964087, lng: 100.587429 },
      { lat: 13.963815, lng: 100.586272 },
      { lat: 13.966047, lng: 100.585674 },
      { lat: 13.966967, lng: 100.585454 },
      { lat: 13.967582, lng: 100.585351 },
      { lat: 13.967854, lng: 100.585334 },
      { lat: 13.967851, lng: 100.586566 },
      { lat: 13.968088, lng: 100.586611 },
      { lat: 13.968253, lng: 100.587355 },
      { lat: 13.968222, lng: 100.587432 },
      { lat: 13.968149, lng: 100.587428 },
      { lat: 13.968105, lng: 100.587363 },
      { lat: 13.968076, lng: 100.587255 },
      { lat: 13.968129, lng: 100.587171 },
      { lat: 13.96821, lng: 100.587161 },
      { lat: 13.968088, lng: 100.586611 },
      { lat: 13.96785, lng: 100.586566 },
      { lat: 13.967617, lng: 100.586525 },
      { lat: 13.966475, lng: 100.586828 },
      { lat: 13.966333, lng: 100.586871 },
      { lat: 13.966152, lng: 100.587145 },
      { lat: 13.96585, lng: 100.587298 },
    ];

    const mapLine = new google.maps.Polyline({
      path: mapLineCoords,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    mapLine.setMap(this.map);
  }

  addDirectionService() {
    this.geolocation.watchPosition().subscribe(position => {
      let latLng = new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      let directionService = new google.maps.DirectionsService();
      let directionDisplay = new google.maps.DirectionsRenderer();
      const testEnd = new google.maps.LatLng(13.963325, 100.587899);
      const build1 = new google.maps.LatLng(13.963325, 100.587899);
      const request = {
        //origin: latLng,
        origin: latLng,
        //destination: testEnd,
        destination: document.getElementById('end'),
        travelMode: 'DRIVING',
      };
      directionService.route(request, function(result, status) {
        if (status == 'OK') {
          directionDisplay.setDirections(result);
        }
      });
      directionDisplay.setMap(this.map);
    });
  }

  showCurrentPostion() {
    this.geolocation.watchPosition().subscribe(position => {
      let latLng = new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );

      let marker = new google.maps.Marker({
        map: this.map,
        position: latLng,
      });
      console.log(latLng);
      let content = '<h4>You are here</h4>';
      this.addInfoWindow(marker, content);
    });
  }

  addMarker(lat, lng, stopName) {
    let marker = new google.maps.Marker({
      map: this.map,

      // animation: google.maps.Animation.DROP,

      position: { lat, lng },
    });

    let content = stopName;

    this.addInfoWindow(marker, content);
  }

  addInfoWindow(marker, content) {
    let infoWindow = new google.maps.InfoWindow({
      content: content,
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  openTrainTab() {
    console.log('star 1');

    if (this.tab1 == false) {
      this.tab1 = true;
    } else {
      this.tab1 = false;
    }

    this.tab2 = false;

    this.tab3 = false;
  }

  openLocationTab() {
    console.log('star 2');

    if (this.tab2 == false) {
      this.tab2 = true;
    } else {
      this.tab2 = false;
    }

    this.tab1 = false;

    this.tab3 = false;
  }

  openWeatherTab() {
    console.log('star 3');

    if (this.tab3 == false) {
      this.tab3 = true;
    } else {
      this.tab3 = false;
    }

    this.tab2 = false;

    this.tab1 = false;
  }
}
