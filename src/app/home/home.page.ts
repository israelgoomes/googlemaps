import { Component, ViewChild, OnInit, NgZone } from '@angular/core';
import { Platform, LoadingController } from '@ionic/angular';
import { Environment, GoogleMaps, GoogleMap, GoogleMapOptions, GoogleMapsEvent, MyLocation, GoogleMapsAnimation, Marker, Geocoder, ILatLng } from '@ionic-native/google-maps';
import { Geolocation } from '@ionic-native/geolocation/ngx';

declare var google: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @ViewChild('map', { static: true }) mapElement: any;

  loading: any;
  map: GoogleMap
  search: string = '';
  searchResults = new Array<any>();
  originMarker: Marker;
  destination: any;
  //pegando os métodos da api places do google, seu script fica na index.html
  googleAutoComplete = new google.maps.places.AutocompleteService();
  googleDirectionService = new google.maps.DirectionsService();
  latitude;
  longitude;



  constructor(
    private platform: Platform,
    private loadingCtrl: LoadingController,
    private ngZone: NgZone,
    private geolocation: Geolocation) { }

  ngOnInit() {
    this.getCurrentCortdinates();
    console.log(google);
    this.mapElement = this.mapElement.nativeElement;

    this.mapElement.style.width = this.platform.width() + 'px';
    this.mapElement.style.height = this.platform.height() + 'px';
    this.loadMap();
  }

  getCurrentCortdinates() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
    })
  }

  async loadMap() {

    this.loading = await this.loadingCtrl.create({ message: 'Por favor, aguarda ...' });
    await this.loading.present();
    Environment.setEnv({
      'API_KEY_FOR_BROWSER_RELEASE': 'AIzaSyCFp72I0Bb8bRi_nLSD_fK7uf0Et_rm8c4',
      'API_KEY_FOR_BROWSER_DEBUG': 'AIzaSyCFp72I0Bb8bRi_nLSD_fK7uf0Et_rm8c4'
    });

    const mapOptions: GoogleMapOptions = {
      controls: {
        zoom: false
      }
    }

    this.map = GoogleMaps.create(this.mapElement, mapOptions);

    this.map.one(GoogleMapsEvent.MAP_READY).then(() => {
      this.addOriginMarker();
    }, error => {
      console.log('Erro ****', error)
    })
  }

  async addOriginMarker() {
    try {
      const myLocation: MyLocation = await this.map.getMyLocation();

      await this.map.moveCamera({
        target: { lat: this.latitude, lng: this.longitude },
        zoom: 18,
      });

      this.originMarker = this.map.addMarkerSync({
        title: "origem",
        icon: '#000',
        animation: GoogleMapsAnimation.DROP,
        position: { lat: this.latitude, lng: this.longitude },
      })

    } catch (error) {
      console.log(error)
    } finally {
      this.loadingCtrl.dismiss();
    }
  }

  searchChanged() {
    console.log(this.search)

    if (!this.search.trim().length) return;

    this.googleAutoComplete.getPlacePredictions({ input: this.search }, predictions => {
      //faz o update conforme é escrito no campo search
      this.ngZone.run(() => {
        this.searchResults = predictions;
      });
    });


  }

  async calcRoute(item: any) {
    this.search = '';
    this.destination = item;

    //pesquisa todos os dados através do endereço, como geolozalização
    const info: any = await Geocoder.geocode({ address: this.destination.description });
    console.log(info);

    let markerDestination: Marker = this.map.addMarkerSync({
      title: this.destination.description,
      icon: '#000',
      animation: GoogleMapsAnimation.DROP,
      position: info[0].position
    });

    this.googleDirectionService.route({
      origin: this.originMarker.getPosition(),
      destination: markerDestination.getPosition(),
      travelMode: 'DRIVING'
    }, async results => {
      console.log('Results', results);
      const points = new Array<ILatLng>();
      const routes = results.routes[0].overview_path;

      //salva a latitude e longitude da rota traçado para ser mostrado uma linha reta
      for (let i = 0; i < routes.length; i++) {
        points[i] = {
          lat: routes[i].lat(),
          lng: routes[i].lng()
        }
      }
      //traça a rota
      await this.map.addPolyline({
        points: points,
        color: '#000',
        width: 3
      });
      //move a camera para o inicio e fim da rota
      this.map.moveCamera({
        target: points
      })

      //centralizar o mapa caso queira colocar uma div em baixo por exemplo
      //this.map.panBy(0, 100)
    })


  }

  async back() {
    try {
      await this.map.clear();
      this.destination = null;
      this.addOriginMarker();
    } catch (error) {
      console.log(error);
    }
  }

  //-24.002590, -46.427251
}
