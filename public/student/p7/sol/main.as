package
{
   import flash.display.MovieClip;
   import flash.text.TextField;
   import flash.events.MouseEvent;
   
   public class main extends MovieClip{ 	

		var grid:Array= new Array(3);
		const FLASH:Boolean=true;
		const PLAYER:Boolean=false;
		
		public function main():void{
			/* Initialize stage and subscribe listener to the start button*/
			startButton.label = "Jugar!!";
			for(var i:int=0; i<3; i++){
				grid[i]=new Array(3);
			}
			
			startButton.addEventListener(MouseEvent.CLICK, fn_start);
		}
		
		function initArray(ar:Array):void{
			for(var i:int=0; i<3; i++){
				for(var j:int=0; j<3;j++){
					if(ar[i][j]){
						removeChild(grid[i][j]);
						ar[i][j]= 0;	/*	Interesting discussion about clear memeory in AS3:
											http://www.actionscript.org/forums/showthread.php3?t=180592
											http://stackoverflow.com/questions/5888576/flash-cs3-how-to-clean-memory
										 */
					}
				}
			}
		}
		
		function fn_start(event:MouseEvent):void{
			var i,j:int;
			
			if ( startButton.stage) {
				
				/* Remove button from the stage, subscribe play listener, init play memory */
				removeChild(startButton);
				
				initArray(grid);
				
				startButton.removeEventListener(MouseEvent.CLICK, fn_start); /* Not needed anymore (for now) */
				square1.addEventListener(MouseEvent.CLICK, fn_start);

				return;
			}	
			
			/* Normal play */
			
			/* Locate click in grid */
			if(event.stageX > stage.stageWidth/3*2){
				i=2;
			}else if (event.stageX > stage.stageWidth/3){
				i=1;
			}else {
				i=0;
			}
			
			if(event.stageY > stage.stageHeight/3*2 ){
				j=2;
			}else if (event.stageY > stage.stageHeight/3 ){
				j=1;
			}else{
				j=0;
			}

			/* Place new from player*/
			if(!grid[i][j]){
				grid[i][j] = new cruz();
				
				grid[i][j].x=17+(stage.stageHeight/3*i);
				grid[i][j].y=28+(stage.stageHeight/3*j);
				addChild(grid[i][j]);
			}
			
			if(checkWin(grid, PLAYER)){
				return;
			}
			
			/* Place new from from Flash */
			
			do{
				i=Math.round(Math.random()*2);
				j=Math.round(Math.random()*2);
			}while(grid[i][j]);
			
			grid[i][j] = new circulo();
				
			grid[i][j].x=17+(stage.stageHeight/3*i);
			grid[i][j].y=28+(stage.stageHeight/3*j);
			addChild(grid[i][j]);
			
			if(checkWin(grid, FLASH)){
				return;
			}
		}
		
		function checkWin(ar:Array, player:Boolean):int{

			/* Determine what kind of class we are looking for*/
			var check;
			if(player){
				check=circulo;
			}else{
				check=cruz;
			}
			var i, j, lin=0, col=0, diag=0;
			
			for(i=0; i<3; i++){ 					 //Check lines and columns
				for(j=0; j<3; j++){
					if(ar[i][j] is check){
						lin++;
					}
					if(ar[j][i] is check){
						col++;
					}
					if( i==j && ar[i][j] is check){
						diag++;
					}
				}
				if(lin==3 || col==3 || diag==3){				/* Out proccess */
			
					addChild(startButton);
					
					startButton.addEventListener(MouseEvent.CLICK, fn_start);
					square1.removeEventListener(MouseEvent.CLICK, fn_start);
					return 1;
				} else {
					lin=col=0;
				}
			}
			return 0;
		}
		
   }
}