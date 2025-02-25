import * as THREE from 'three';
export class Storage {
  private game;


  public cubeSize = 3;
  public flipConfig = 0;
  public dificulty = 1;

  public fov = 10;


  public colors!:string;
  public theme = 'cube';

  public scores!:any;


  constructor( game:any ) {
    this.game = game;

    const userVersion = localStorage.getItem( 'theCube_version' );

    if ( ! userVersion || userVersion !== (window as any).gameVersion ) {
      this.clearGame();
      this.clearPreferences();
      this.migrateScores();
      localStorage.setItem( 'theCube_version', (window as any).gameVersion );
    }
  }

  public init() {
    this.loadPreferences();
    this.loadScores();
  }

  public loadGame() {

    try {

      const gameInProgress = localStorage.getItem( 'theCube_playing' ) === 'true';

      if ( ! gameInProgress ) throw new Error();

      const theCube_savedState = localStorage.getItem( 'theCube_savedState' );
      const gameCubeData = theCube_savedState ? JSON.parse( theCube_savedState ) : null;
      
      const theCube_time = localStorage.getItem( 'theCube_time' );
      const gameTime = theCube_time ? parseInt( theCube_time ) : null;

      if ( ! gameCubeData || gameTime === null ) throw new Error();
      if ( gameCubeData.size !== this.game.cube.sizeGenerated ) throw new Error();

      this.game.cube.loadFromData( gameCubeData );

      this.game.timer.deltaTime = gameTime;

      this.game.saved = true;

    } catch( e ) {

      this.game.saved = false;

    }

  }

  public saveGame() {

    const gameInProgress = 'true';
    const gameCubeData: any= { names: [], positions: [], rotations: [] };
    const gameTime = this.game.timer.deltaTime;

    gameCubeData.size = this.game.cube.sizeGenerated;

    this.game.cube.pieces.forEach( (piece: any) => {

      gameCubeData.names.push( piece.name );
      gameCubeData.positions.push( piece.position );
      // gameCubeData.rotations.push( piece.rotation.toVector3() );
      gameCubeData.rotations.push( new THREE.Vector3().setFromEuler(piece.rotation));


    } );

    localStorage.setItem( 'theCube_playing', gameInProgress );
    localStorage.setItem( 'theCube_savedState', JSON.stringify( gameCubeData ) );
    localStorage.setItem( 'theCube_time', gameTime );

  }

  public clearGame() {

    localStorage.removeItem( 'theCube_playing' );
    localStorage.removeItem( 'theCube_savedState' );
    localStorage.removeItem( 'theCube_time' );

  }

  private loadScores() {

    try {
      const theCube_scores = localStorage.getItem( 'theCube_scores' );
      const scoresData = theCube_scores ? JSON.parse(theCube_scores):null;

      if ( ! scoresData ) throw new Error();

      this.game.scores.data = scoresData;

    } catch( e ) {}

  }

  private saveScores() {

    const scoresData = this.game.scores.data;

    localStorage.setItem( 'theCube_scores', JSON.stringify( scoresData ) );

  }

  clearScores() {

    localStorage.removeItem( 'theCube_scores' );

  }

  private migrateScores() {

    try {

      const theCube_scoresData = localStorage.getItem( 'theCube_scoresData' );
      const theCube_scoresBest = localStorage.getItem( 'theCube_scoresBest' );
      const theCube_scoresWorst = localStorage.getItem( 'theCube_scoresWorst' );
      const theCube_scoresSolves =localStorage.getItem( 'theCube_scoresSolves' );


      const scoresData = theCube_scoresData ? JSON.parse( theCube_scoresData ) : null;
      const scoresBest = theCube_scoresBest ? parseInt( theCube_scoresBest ) : null;
      const scoresWorst = theCube_scoresWorst ? parseInt( theCube_scoresWorst ) : null;
      const scoresSolves = theCube_scoresSolves ? parseInt( theCube_scoresSolves ) : null;

      if ( ! scoresData || ! scoresBest || ! scoresSolves || ! scoresWorst ) return false;

      this.game.scores.data[ 3 ].scores = scoresData;
      this.game.scores.data[ 3 ].best = scoresBest;
      this.game.scores.data[ 3 ].solves = scoresSolves;
      this.game.scores.data[ 3 ].worst = scoresWorst;

      localStorage.removeItem( 'theCube_scoresData' );
      localStorage.removeItem( 'theCube_scoresBest' );
      localStorage.removeItem( 'theCube_scoresWorst' );
      localStorage.removeItem( 'theCube_scoresSolves' );

    } catch( e ) {}

    return true;
  }

  private loadPreferences() {
    try {
      const theCube_preferences = localStorage.getItem( 'theCube_preferences' );
      const preferences = theCube_preferences ? JSON.parse( theCube_preferences) : null;

      if ( ! preferences ) throw new Error();

      this.cubeSize = parseInt( preferences.cubeSize );
      this.flipConfig = parseInt( preferences.flipConfig );
      this.dificulty = parseInt( preferences.dificulty );

      this.fov = parseFloat( preferences.fov );
      // this.game.world.resize();

      this.colors = preferences.colors;
      this.theme = preferences.theme;
    } catch (e) {
      console.error(e);
    }
  }

  public savePreferences() {
    const preferences = {
      cubeSize: this.game.cube.size,
      flipConfig: this.game.controls.flipConfig,
      dificulty: this.game.scrambler.dificulty,
      fov: this.game.world.fov,
      theme: this.game.themes.theme,
      colors: this.game.themes.colors,
    };

    localStorage.setItem( 'theCube_preferences', JSON.stringify( preferences ) );

  }

  private clearPreferences() {

    localStorage.removeItem( 'theCube_preferences' );

  }

}
