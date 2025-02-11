import {Range} from './Range';

export class Preferences {
  private game;
  private ranges: any = {};
  constructor( game: any ) {

    this.game = game;

  }

  public init() {

    this.ranges = {

      size: new Range( 'size', {
        value: this.game.cube.size,
        range: [ 2, 5 ],
        step: 1,
        onUpdate: (value:number) => {
          console.log('update size'); 
          this.game.cube.size = value;

          this.game.preferences.ranges.scramble.list.forEach( ( item:any, i:number ) => {

            item.innerHTML = this.game.scrambler.scrambleLength[ this.game.cube.size ][ i ];

          } );

        },
        onComplete: () => this.game.storage.savePreferences(),
      } ),

      flip: new Range( 'flip', {
        value: this.game.controls.flipConfig,
        range: [ 0, 2 ],
        step: 1,
        onUpdate: (value: number) => {
          console.log('update flip'); 
          this.game.controls.flipConfig = value;

        },
        onComplete: () => this.game.storage.savePreferences(),
      } ),

      scramble: new Range( 'scramble', {
        value: this.game.scrambler.dificulty,
        range: [ 0, 2 ],
        step: 1,
        onUpdate: (value: number) => {
          console.log('update scramble'); 
          this.game.scrambler.dificulty = value;

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

      fov: new Range( 'fov', {
        value: this.game.world.fov,
        range: [ 2, 45 ],
        onUpdate: (value:number) => {
          console.log('update fov'); 
          this.game.world.fov = value;
          this.game.world.resize();

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

      theme: new Range( 'theme', {
        value: ({ cube: 0, erno: 1, dust: 2, camo: 3, rain: 4 } as any)[ this.game.themes.theme ],
        range: [ 0, 4 ],
        step: 1,
        onUpdate: (value:number) => {
          console.log('update theme'); 
          const theme = [ 'cube', 'erno', 'dust', 'camo', 'rain' ][ value ];
          this.game.themes.setTheme( theme );

        },
        onComplete: () => this.game.storage.savePreferences()
      } ),

      hue: new Range( 'hue', {
        value: 0,
        range: [ 0, 360 ],
        onUpdate: (value:any) => {console.log('update huye'); this.game.themeEditor.updateHSL()},
        onComplete: () => this.game.storage.savePreferences(),
      } ),

      saturation: new Range( 'saturation', {
        value: 100,
        range: [ 0, 100 ],
        onUpdate: (value:any) => {console.log('update saturation'); this.game.themeEditor.updateHSL()},
        onComplete: () => this.game.storage.savePreferences(),
      } ),

      lightness: new Range( 'lightness', {
        value: 50,
        range: [ 0, 100 ],
        onUpdate: (value:any) => {console.log('update lightness'); this.game.themeEditor.updateHSL()},
        onComplete: () => this.game.storage.savePreferences(),
      } ),

    };

    this.ranges.scramble.list.forEach( ( item:any, i:number ) => {

      item.innerHTML = this.game.scrambler.scrambleLength[ this.game.cube.size ][ i ];

    } );
    
  }

}
