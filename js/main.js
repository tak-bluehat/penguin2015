(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

var penguinGame = function(){
	var that = {};
	
	var animation_flag = false;
	var stage_id = 1;
	var point = 0;
	var life = 3;
	var old_point = 0;
	var ground_id = 0;
	var sea_id = 0;
	var fish_id = 0;
	var point_id = 0;

	var sea_max_left = 0;
	var ground_max_left = 0;
	
	var move_sea = 2;
	var move_ground = 5;
	var move_fish = 4;
	var move_shati = 3;
	var move_ship = 1;

	var sea_array = [];
	var ground_array = [];
	var fish_array = [];
	var circle_array = [];

	var animation_frame;
	
	var penguin_object = {};
	var shati_object = null;
	var ship_object = null;

	var rest_time = 180;
	var time_keeper = false;
	var stage_clear_flag = false;

	var target_point = 15000;

	var game_board = '#board';

	var init = function(){
		$( game_board ).append( append_img_tag( 'title.png', 50, 40, 211, 145 ) );
		$( game_board ).append( append_img_tag( 'start_btn.png', 70, 210, 190, 61 ) ).promise().done( function(){
			$( 'img[src$="images/start_btn.png"]' ).click( function(){
				run();
			});
		});
		$( game_board ).append( append_img_tag( 'title_penguin.png', 350, 70, 141, 211 ) );
	};
	
	var retry = function(){
		$( game_board ).append( append_img_tag( 'retry_btn.png', 180, 130, 190, 61, 'retry', 'retry' ) );
		$( game_board ).append( '<span id="oldpoint" style="position:absolute;display:inline-block;text-align:left;left:180px;top:100px;width:120px;height:20px;">' + old_point + ' points</span>' );
		life--;
		$( '#retry' ).on( 'click', function(){
			run();
		});
	};

	var game_over = function(){
		$( game_board ).append( append_img_tag( 'gameover.png', 180, 130, 190, 61, 'gameover', 'gameover' ) );
		$( game_board ).append( append_img_tag( 'retry_btn.png', 180, 200, 190, 61, 'retry', 'retry' ) );
		$( game_board ).append( '<span id="oldpoint" style="position:absolute;display:inline-block;text-align:left;left:180px;top:100px;width:120px;height:20px;">' + old_point + ' points</span>' );
		life = 3;

		$( '#retry' ).on( 'click', function(){
			run();
		});
	};
	
	var goal = function(){
		$( game_board ).append( append_img_tag( 'goal.png', 180, 130, 190, 61, 'goal', 'goal' ) );
		$( game_board ).append( append_img_tag( 'retry_btn.png', 180, 200, 190, 61, 'retry', 'retry' ) );
		$( game_board ).append( '<span id="oldpoint" style="position:absolute;display:inline-block;text-align:left;left:180px;top:100px;width:120px;height:20px;">' + old_point + ' points</span>' );
		life = 3;

		$( '#retry' ).on( 'click', function(){
			run();
		});
	};

	var run = function(){
		$( game_board ).html( '' ).promise().done( function(){
			set_game_label();
			init_parameter();
			penguin_object = penguinObject();
			penguin_object.init();
			penguin_object.construct();
			time_keeper = setInterval( function(){
				reduce_time();
			}, 1000 );
			animation_flag = true;
			animation_frame = requestAnimationFrame( function(){
				manage_object();
				move_object();
			});
		});
	};

	var init_parameter = function(){
		point = 0;
		rest_time = 180;
		
		ground_id = 0;
		sea_id = 0;
		fish_id = 0;
		
		ground_max_left = 0;
		sea_max_left = 0;
		
		ground_array = [];
		sea_array = [];
		fish_array = [];
		
		shati_object = null;
		stage_clear_flag = false;
	};

	var set_game_label = function(){
		$( game_board ).append( append_img_tag( 'leftbar.png', 10, 6, 227, 28 ) );
		$( game_board ).append( append_img_tag( 'rightbar.png', 373, 6, 185, 28 ) );
		$( game_board ).append( append_img_tag( 'stage' + stage_id + '@2x.png', 76, 11, 67, 23 ) );
		for( var index = 0; index < 3; index++ ){
			if( index < life ){
				$( game_board ).append( append_img_tag( 'life.png', ( 155 + index * 26 ), 11, 22, 19 ) );
			}else{
				$( game_board ).append( append_img_tag( 'life2.png', ( 155 + index * 26 ), 11, 22, 19 ) );
			}
		}
		$( game_board ).append( '<span id="point" style="display:inline-block;text-align:right;color:#333;font-size:15px;position:absolute;left:378px;top:12px;width:170px;height:50px">' + display_point() + '</span>' );
		$( game_board ).append( '<span id="time" style="display:inline-block;text-align:left;color:#333;font-size:15px;position:absolute;left:23px;top:12px;width:90px;height:50px">' + display_time() + '</span>' );
	};
	
	var append_img_tag = function( src, x, y, width, height, id, class_name, z_index ){
		if( typeof z_index === 'undefined' ){
			var z_index = 1;
		}
		if( typeof id === 'undefined' ){
			var id = '';
		}
		if( typeof class_name === 'undefined' ){
			var class_name = '';
		}
		return '<img id="' + id + '" class="' + class_name + '" src="images/' + src + '" style="left:' + x + 'px;top:' + y + 'px;width:' + width + 'px;height:' + height + 'px;z-index:' + z_index + ';">';
	};

	var display_point = function(){
		return point + '/' + target_point; 
	};
	
	var reduce_time = function(){
		rest_time -= 1;
		if( rest_time === 30 ){
			$( '#time' ).css( 'color', 'red' );
		}
	};
	
	var display_time = function(){
		var minute = parseInt( rest_time / 60, 10 );
		var second = parseInt( rest_time % 60, 10 );
		
		if( minute < 10 ){
			minute = '0' + minute;
		}

		if( second < 10 ){
			second = '0' + second;
		}
	
		return minute + ':' + second;
	};

	var get_random_int = function(start, end){
		var result = start + Math.floor( Math.random() * ((end - start) + 1));
		return result;
	};

	var stop_game = function(){
		animation_flag = false;
		clearInterval( time_keeper );
		old_point = point;
	};

	var end_game = function(){
		penguin_object.end();
		$( game_board ).html( '' ).promise().done( function(){
			if( stage_clear_flag === true ){
				goal();
			}else{
				if( life > 1 ){
					retry();
				}else{
					game_over();
				}
			}
		});
	};

	var manage_object = function(){
		if( ground_id === 0 ){
			create_ground( ground_id, ground_max_left );
			create_sea( sea_id, sea_max_left );
			return true;		
		}

		if( $( '.ground' ).length < 2 ){
			create_ground( ground_id, ground_max_left );
		}

		if( $( '.sea' ).length < 2 ){
			create_sea( sea_id, sea_max_left );
		}

		if( $( '.fish' ).length < 6 ){
			create_fish( fish_id, get_random_int( 600, 1200 ), get_random_int( 60, 260 ), get_random_int( 0, 10 ) );
		}

		if( shati_object === null && get_random_int( 1, 300 ) === 1 ){
			create_shati( get_random_int( 600, 1200 ), get_random_int( 60, 180 ) );
		}

		return true;
	};

	var move_object = function(){

		// reload info
		$( '#point').text( display_point() );
		$( '#time' ).text( display_time() );

		// time_out
		if( rest_time <= 0 ){
			stop_game();
			if( point < target_point ){
				$( game_board ).append( append_img_tag( 'timeup.png', 180, 130, 190, 61, 'timeup', 'timeup' ) );
			}else{
				$( game_board ).append( append_img_tag( 'stageclear.png', 180, 130, 190, 61, 'stageclear', 'stageclear' ) );
				stage_clear_flag = true;
			}
			setTimeout( function(){
				end_game();
			}, 3000 );
			return true;
		}

		// move_penguin

		if( penguin_object.get_up_flag() === true ){
			var top = penguin_object.get_top() - penguin_object.get_move_speed();
			if( penguin_object.get_top() > 60 ){
				$( '#penguin' ).css( { top: top} );
				penguin_object.set_top( top );
				if( $( '#rest_time' ).size() > 0 ){
					$( '#rest_time' ).css({'left': ( penguin_object.get_left() + 20 ), 'top': ( penguin_object.get_top() - 20 ) } );
				}			
			}
		}else if( penguin_object.get_down_flag() === true ){
			var top = penguin_object.get_top() + penguin_object.get_move_speed();
			if( penguin_object.get_top() < 240 ){
				$( '#penguin' ).css( { top: top} );
				penguin_object.set_top( top );			
				if( $( '#rest_time' ).size() > 0 ){
					$( '#rest_time' ).css({'left': ( penguin_object.get_left() + 20 ), 'top': ( penguin_object.get_top() - 20 ) } );
				}			
			}
		}


		// move_ground
		var ground_object;
		var element;
		var left;
		
		for( var index = ( ground_array.length - 1 ); ( index >= 0 && ground_array[index] !== null ); index-- ){
			ground_object = ground_array[index];
			element = '#ground' + index;
			if( ( ground_object.get_left() + ground_object.get_width() ) < 0 ){
				$( element ).remove();
				ground_array[index] = null;
				continue;
			}
			left = ground_object.get_left();
			left -= move_ground;
			$( element ).css( 'left', left );
			ground_object.set_left( left );
		}
		
		var ground_index = ground_array.length - 1;
		ground_object = ground_array[ground_index];
		ground_max_left = ground_object.get_left() + ground_object.get_width();


		// move_sea
		var sea_object;
		
		for( var index = ( sea_array.length - 1 ); ( index >= 0 && sea_array[index] !== null ); index-- ){
			sea_object = sea_array[index];
			element = '#sea' + index;
			if( ( sea_object.get_left() + sea_object.get_width() ) < 0 ){
				$( element ).remove();
				sea_array[index] = null;
				continue;
			}
			left = sea_object.get_left();
			left -= move_sea;
			$( element ).css( 'left', left );
			sea_object.set_left( left );
		}

		var sea_index = sea_array.length - 1;
		sea_object = sea_array[sea_index];
		sea_max_left = sea_object.get_left() + sea_object.get_width();
			
		// move_fish
		var fish_object;
		
		$( '.fish' ).each( function( index, element ){
			fish_index = $( element ).prop( 'id' ).replace( 'fish', '' );
			//element = '#fish' + index;
			fish_object = fish_array[fish_index];
			if( fish_object !== null ){
				if( ( fish_object.get_left() + fish_object.get_width() ) < 0 ){
					$( element ).remove();
					fish_array[fish_index] = null;
					return false;
				}
				
				// eat_process
				if( penguin_object.get_eat_flag() === true && judge_eat( fish_object ) === true ){
					if( fish_object.get_fish_type() === 0 || fish_object.get_fish_type() === 1 ){
						create_circle( point_id, penguin_object.get_left(), penguin_object.get_top(), fish_object.get_fish_type() );
						if( fish_object.get_fish_type() === 1 ){
							penguin_object.to_trans();
						}
					}else if( fish_object.get_fish_type() === 2 ){
						penguin_object.to_black();
					}
					$( element ).remove();
					fish_array[fish_index] = null;

					if( fish_object.get_fish_type() === 0 ){
						point += 100;
					}else if( fish_object.get_fish_type() === 1 ){
						point += 300;
					}
					return false;
				} 
			
				left = fish_object.get_left();
				left -= move_fish;
				$( element ).css( 'left', left );
				fish_object.set_left( left );
			}
		});

		// shati_move
		if( shati_object !== null ){
			if( penguin_object.get_trans_flag() === false && judge_shati_collision() === true ){
				$( game_board ).append( append_img_tag( 'collision.png', 180, 130, 190, 61, 'collision', 'collision' ) );
				shati_object.end();
				stop_game();
				setTimeout( function(){
					end_game();
				}, 1500 );
			}

			if( ( shati_object.get_left() + shati_object.get_width() ) < 0 ){
				$( '#shati' ).remove();
				shati_object.end();
				shati_object = null;
			}else{
				left = shati_object.get_left();
				left -= move_shati;
				$( '#shati' ).css( 'left', left );
				shati_object.set_left( left );
			}
		}

		if( animation_flag === true ){
			requestAnimationFrame( function(){
				manage_object();
				move_object();
			});
		}
	};

	var create_ground = function( id, left ){
		ground_object = groundObject();
		ground_object.init();
		ground_object.set_ground_id( id );
		ground_object.set_left( left );
		ground_object.construct();
		
		ground_array.push( ground_object );
		ground_id++;
	};

	var create_sea = function( id, left ){
		sea_object = seaObject();
		sea_object.init();
		sea_object.set_sea_id( id );
		sea_object.set_left( left );
		sea_object.construct();
		
		sea_array.push( sea_object );
		sea_id++;
	};

	var create_fish = function( id, left, top, type ){
		fish_object = fishObject();
		fish_object.set_fish_id( id );
		fish_object.set_left( left );
		fish_object.set_top( top );
		var fish_type = 0;
		if( type === 9 ){
			fish_type = 1;
		}else if( type === 10 ){
			fish_type = 2;
		}
		fish_object.set_fish_type( fish_type );
		fish_object.construct();

		fish_array.push( fish_object );
		fish_id++;
	};

	var create_circle = function( id, left, top, fish_type ){
		pointcircle_object = pointcircleObject();
		pointcircle_object.init();
		pointcircle_object.set_point_id( id );
		pointcircle_object.set_left( left + 50 );
		pointcircle_object.set_top( top );
		pointcircle_object.set_fish_type( fish_type );
		pointcircle_object.construct();

		point_id++;
	};

	var create_shati = function( left, top ){
		shati_object = shatiObject();
		shati_object.init();
		shati_object.set_left( left );
		shati_object.set_top( top );
		shati_object.construct();
	};

	var judge_eat = function( fish ){
		if( ( fish.get_left() < ( penguin_object.get_left() + 40 ) && penguin_object.get_left() < ( fish.get_left() + fish.get_width() ) ) && ( penguin_object.get_top() < fish.get_top() && fish.get_top() < ( penguin_object.get_top() + penguin_object.get_height() ) ) ){
			return true;
		}
		return false;
	};

	var judge_shati_collision = function(){
		if( ( shati_object.get_left() < penguin_object.get_left() && penguin_object.get_left() < ( shati_object.get_left() + shati_object.get_width() - 100 ) ) && ( shati_object.get_top() + 20 ) < ( penguin_object.get_top() + 10 ) && ( penguin_object.get_top() + 10 ) < ( shati_object.get_top() + ( shati_object.get_height() - 40 ) ) ){
			return true;
		}
		return false;
	};

	var baseObject = function(){
		var base = {};
		var left;
		var top;
		var width;
		var height;

		var set_left = function( value ){
			left = value;
		};

		var set_top = function( value ){
			top = value;
		};

		var set_width = function( value ){
			width = value;
		};

		var set_height = function( value ){
			height = value;
		};

		var get_left = function(){
			return left;
		};

		var get_top = function(){
			return top;
		};

		var get_width = function(){
			return width;
		};

		var get_height = function(){
			return height;
		};

		base.set_left = set_left;
		base.set_top = set_top;
		base.set_width = set_width;
		base.set_height = set_height;
		base.get_left = get_left;
		base.get_top = get_top;
		base.get_width = get_width;
		base.get_height = get_height;

		return base;
	};
	
	var groundObject = function(){
		var ground = baseObject();
		var ground_inner_id;

		var init = function(){
			ground.set_width( 1136 );
			ground.set_height( 31 );
			ground.set_top( 289 );
		};

		var construct = function(){
			$( game_board ).append( append_img_tag( 'ground.png', ground.get_left(), ground.get_top(), ground.get_width(), ground.get_height(), 'ground' + ground_inner_id ,'ground' ) );
		};

		var set_ground_id = function( value ){
			ground_inner_id = value;
		};

		var get_ground_id = function(){
			return ground_inner_id;
		};

		ground.init = init;
		ground.construct = construct;
		ground.set_ground_id = set_ground_id;
		ground.get_ground_id = get_ground_id;

		return ground;
	};
	
	var seaObject = function(){
		var sea = baseObject();
		var sea_inner_id;

		var init = function(){
			sea.set_width( 1136 );
			sea.set_height( 280 );
			sea.set_top( 40 );
		};

		var construct = function(){
			$( game_board ).append( append_img_tag( 'sea.png', sea.get_left(), sea.get_top(), sea.get_width(), sea.get_height(), 'sea' + sea_inner_id, 'sea', -100 ) );
		};

		var set_sea_id = function( value ){
			sea_inner_id = value;
		};

		var get_sea_id = function(){
			return sea_inner_id;
		};

		sea.init = init;
		sea.construct = construct;
		sea.set_sea_id = set_sea_id;
		sea.get_sea_id = get_sea_id;

		return sea;
	};

	var penguinObject = function(){
		var penguin = baseObject();
		var change_id = 0;
		var eat_flag = false;
		var black_flag = false;
		var trans_flag = false;
		var up_flag = false;
		var down_flag = false;
		var move_speed;
		var normal_speed = 5;
		var black_speed = 3;
		var special_speed = 8;
		var status_rest_time = 15;
		var rest_time;
		var swim_frame = false;

		var time_frame = false;
		var black_timer = false;
		var trans_timer = false;

		var init = function(){
			penguin.set_top( 150 );
			penguin.set_left( 100 );
			penguin.set_width( 88 );
			penguin.set_height( 81 );
			move_speed = normal_speed;
		};

		var construct = function(){
			$( game_board ).append( append_img_tag( 'swim_penguin.png', penguin.get_left(), penguin.get_top(), penguin.get_width(), penguin.get_height(), 'penguin', 'penguin' ) ).promise().done( function(){
				bind_key();
				swim_frame = setInterval( function(){ change_image(); }, 500 );
			});
			set_rest_time();
		};

		var end = function(){
			clearInterval( swim_frame );
		};

		var change_image = function(){
			if( change_id === 0 ){
				if( black_flag === false && trans_flag === false ){
					$( '#penguin' ).prop( 'src', 'images/swim_penguin2.png' );
				}else if( black_flag === true ){
					$( '#penguin' ).prop( 'src', 'images/swim_penguin2_black.png' );
				}else if( trans_flag === true ){
					$( '#penguin' ).prop( 'src', 'images/swim_penguin2_gold.png' );
				}
				change_id++;
			}else{
				if( black_flag === false && trans_flag === false ){
					$( '#penguin' ).prop( 'src', 'images/swim_penguin.png' );
				}else if( black_flag === true ){
					$( '#penguin' ).prop( 'src', 'images/swim_penguin_black.png' );
				}else if( trans_flag === true ){
					$( '#penguin' ).prop( 'src', 'images/swim_penguin_gold.png' );
				}
				change_id = 0;

			}
		};

		var bind_key = function(){
			$(document).keydown( function( event ){
				if( event.which === 38 ){
					up();
				}else if( event.which === 40 ){
					down();
				}else if( event.which === 32 ){
					eat();
				}
			});
			$(document).keyup( function( event ){
				if( event.which === 38 ){
					reset_up();
				}else if( event.which === 40 ){
					reset_down();
				}
			});
		};

		var eat = function(){
			if( change_id === 0 && black_flag === false && trans_flag === false ){
				$( '#penguin' ).prop( 'src', 'images/swim_penguin_eat.png' );
			}else if( change_id === 1 && black_flag == false && trans_flag == false ){
				$( '#penguin' ).prop( 'src', 'images/swim_penguin2_eat.png' );
			}else if( change_id === 0 && black_flag == true && trans_flag == false ){
				$( '#penguin' ).prop( 'src', 'images/swim_penguin_eat_black.png' );
			}else if( change_id === 1 && black_flag == true && trans_flag == false ){
				$( '#penguin' ).prop( 'src', 'images/swim_penguin2_eat_black.png' );
			}else if( change_id === 0 && black_flag == false && trans_flag == true ){
				$( '#penguin' ).prop( 'src', 'images/swim_penguin_eat_gold.png' );
			}else if( change_id === 1 && black_flag == false && trans_flag == true ){
				$( '#penguin' ).prop( 'src', 'images/swim_penguin2_eat_gold.png' );
			}
			eat_flag = true;
			setTimeout( function(){ clear_eat_flag() }, 1000 );
		};

		var to_black = function(){
			if( black_flag === false ){
				black_flag = true;
				trans_flag = false;
				move_speed = black_speed;
				rest_time = status_rest_time;
				display_rest_time();
				clearTimeout( trans_timer );
				black_timer = setTimeout( function(){
					cancel_black();
				}, status_rest_time * 1000);
				clearInterval( time_frame );
				time_frame = setInterval( function(){
					reduce_time();
				}, 1000 );
			}
		};

		var to_trans = function(){
			if( black_flag === false && trans_flag === false ){
				trans_flag = true;
				move_speed = special_speed;
				rest_time = status_rest_time;
				display_rest_time();
				trans_timer = setTimeout( function(){
					cancel_trans();
				}, status_rest_time * 1000);
				clearInterval( time_frame );
				time_frame = setInterval( function(){
					reduce_time();
				}, 1000 );
			}
		};
		
		var cancel_black = function(){
			black_flag = false;
			move_speed = normal_speed;
			clearInterval( time_frame );
			remove_rest_time();
		};

		var cancel_trans = function(){
			trans_flag = false;
			move_speed = normal_speed;
			clearInterval( time_frame );
			remove_rest_time();
		};

		var set_rest_time = function(){
			$( game_board ).append( '<span id="rest_time" style="opacity:0;color:white;font-size:10px;position:absolute;left:' + ( penguin.get_left() + 20 ) + 'px;top:' + ( penguin.get_top() - 20 ) + 'px;">あと' + rest_time + '秒</span>' );
		}

		var display_rest_time = function(){
			$( '#rest_time' ).text( 'あと' + rest_time + '秒' );
			$( '#rest_time' ).css({
				'opacity': 1,
				'left': penguin.get_left() + 20,
				'top': penguin.get_top() - 20
			});
		}	

		var remove_rest_time = function(){
			$( '#rest_time' ).css( 'opacity', 0 );
			rest_time = status_rest_time;
		};

		var reduce_time = function(){
			rest_time -= 1;
			$( '#rest_time' ).text( 'あと' + rest_time + '秒' );
		};

		var clear_eat_flag = function(){
			eat_flag = false;
		};

		var get_eat_flag = function(){
			return eat_flag;
		};

		var up = function(){
			up_flag = true;
			down_flag = false;
		};
	
		var reset_up = function(){
			up_flag = false;
		};

		var down = function(){
			down_flag = true;
			up_flag = false;
		};

		var reset_down = function(){
			down_flag = false;
		};

		var get_up_flag = function(){
			return up_flag;
		};

		var get_down_flag = function(){
			return down_flag;
		};

		var get_move_speed = function(){
			return move_speed;
		};

		var get_trans_flag = function(){
			return trans_flag;
		};
		
		penguin.init = init;
		penguin.construct = construct;
		penguin.end = end;
		penguin.get_up_flag = get_up_flag;
		penguin.get_down_flag = get_down_flag;
		penguin.get_move_speed = get_move_speed;
		penguin.get_eat_flag = get_eat_flag;
		penguin.to_black = to_black;
		penguin.to_trans = to_trans;
		penguin.get_trans_flag = get_trans_flag;

		return penguin;
	
	};

	var fishObject = function(){
		var fish = baseObject();
		var fish_type;
		var fish_inner_id;

		var init = function(){
			// nothing		
		};

		var construct = function(){
			var image = '';
			if( fish_type === 0 ){
				fish.set_width( 30 );
				fish.set_height( 22 );
				image = 'fish.png';
			}else if( fish_type === 1 ){
				fish.set_width( 47 );
				fish.set_height( 43 );
				image = 'fish2.png';
			}else if( fish_type === 2 ){
				fish.set_width( 95 );
				fish.set_height( 22 );
				image = 'fish3.png';
			}
			$( game_board ).append( append_img_tag( image, fish.get_left(), fish.get_top(), fish.get_width(), fish.get_height(), 'fish' + fish_inner_id, 'fish' ) );
		};

		var set_fish_id = function( value ){
			fish_inner_id = value;
		};

		var get_fish_id = function(){
			return fish_inner_id;
		};

		var set_fish_type = function( value ){
			fish_type = value;
		};

		var get_fish_type = function( value ){
			return fish_type;
		};

		fish.init = init;
		fish.construct = construct;
		fish.set_fish_id = set_fish_id;
		fish.get_fish_id = get_fish_id;
		fish.set_fish_type = set_fish_type;
		fish.get_fish_type = get_fish_type;

		return fish;
	};

	var pointcircleObject = function(){
		var pointcircle = baseObject();
		var fish_type;
		var pointcircle_inner_id;
		
		var init = function(){
			pointcircle.set_width( 27 );
			pointcircle.set_height( 36 );
		};
		
		var construct = function(){
			var image_circle = '';
			var image_title = '';
			if( fish_type === 0 ){
				image_circle = 'point_circle.png';
				image_title = 'point_title.png';
			}else if( fish_type === 1 ){
				image_circle = 'point_circle_2.png';
				image_title = 'point_title_2.png';
			}
			$( game_board ).append( append_img_tag( image_circle, ( pointcircle.get_left() + 6.25 ), ( pointcircle.get_top() + 15.5 ), 10, 10, 'pointcircle' + pointcircle_inner_id, 'pointcircle' ) );
			$( game_board ).append( append_img_tag( image_title, pointcircle.get_left(), pointcircle.get_top(), 27, 11, 'pointtitle' + pointcircle_inner_id, 'pointtitle' ) );
			$( '#pointcircle' + pointcircle_inner_id ).css( 'opacity', 0.5 );
			$( '#pointtitle' + pointcircle_inner_id ).css( 'opacity', 0 );
			
			$( '#pointcircle' + pointcircle_inner_id ).animate({
				'opacity': 1,
				'left': pointcircle.get_left() + 1.25,
				'top': pointcircle.get_top() + 10.5,
				'width': 25,
				'height': 25
			}, 500, 'swing', function(){
				$(this).remove();
			});
			$( '#pointtitle' + pointcircle_inner_id ).animate({
				'opacity': 1
			}, 500, 'swing', function(){
				$(this).remove();
			});
			
			
		};
		
		var set_point_id = function( value ){
			pointcircle_inner_id = value;
		};

		var get_point_id = function(){
			return pointcircle_inner_id;
		};

		
		var set_fish_type = function( value ){
			fish_type = value;
		};

		var get_fish_type = function(){
			return fish_type;
		};

		pointcircle.init = init;
		pointcircle.construct = construct;
		pointcircle.set_point_id = set_point_id;
		pointcircle.get_point_id = get_point_id;
		pointcircle.set_fish_type = set_fish_type;
		pointcircle.get_fish_type = get_fish_type;

		return pointcircle;
	};

	var shatiObject = function(){
		var shati = baseObject();
		var change_id = 0;
		var frame_id = false;
		
		var init = function(){
			shati.set_width( 230 );
			shati.set_height( 103 );
		};

		var construct = function(){
			$( game_board ).append( append_img_tag( 'shati.png', shati.get_left(), shati.get_top(), shati.get_width(), shati.get_height(), 'shati', 'shati' ) );

			frame_id = setInterval( function(){
				change_image();
			}, 500 );
		};

		var end = function(){
			clearInterval( frame_id );
		};

		var change_image = function(){
			if( change_id === 0 ){
				$( '#shati' ).prop( 'src', 'images/shati2.png' );
				change_id++;
			}else if( change_id === 1 ){
				$( '#shati' ).prop( 'src', 'images/shati.png' );
				change_id = 0;
			}
		};
		
		shati.init = init;
		shati.construct = construct;
		shati.end = end;
	
		return shati;
	};

	that.init = init;

	return that;	
};

window.onload = function(){
	var gameObject = penguinGame();
	gameObject.init();
};
