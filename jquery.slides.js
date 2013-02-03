/**
 * slides | jQuery plugin
 * Copyright (C) 2013 Vecora AS
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 * @author Erling Owe <owe@vecora.no>
 * @copyright Vecora AS, 2013
 */


/*
 * NOTES ABOUT CUSTOM TRANSITIONS
 *
 */

/*
 * TODO
 *  - Use Modernizr to detect features so we can use GPU when possible (important for mobile devices).
 */


(function($) {

	// Stores registered transitions.
	var transitions = [];


	$.slides = {};

	$.slides.registerTransition = function(obj) {
		transitions[obj.name] = {};
		transitions[obj.name].transition = obj.transition;
		transitions[obj.name].init = obj.init;
	};



	$.fn.slides = function( options ) {

		var defaultOptions = {
			api: false,
			continuous: true, 
			index: 0,
			onSlideChange: function() {}, 
			transition: undefined,
			transitionOptions: {}
		};

		var opts = jQuery.extend({}, defaultOptions, options);
		var api;


 		this.each(function () {
			
			var outerContainer = $(this);
 			var innerContainer = outerContainer.wrapInner('<div></div>').children();
			var slides = innerContainer.children();

			api = {
	
				// TODO: Ensure that changing animation is secure.
 	            transition: function(transition, options) {
					opts.transition = transition;
					opts.transitionOptions = options;
					transitions[opts.transition].init();
				},

				// Sets whether it is possible to go from the last slide to the first and visa versa.
 	            continuous: opts.continuous,

				// Triggers before a slide change occours.
 	            onSlideChange: opts.onSlideChange,

				// Gets the next index.
 				nextIndex: function() { return nextIndex(); },

				// Gets the previous index.
				prevIndex: function() { return prevIndex(); },
				
				// Sets the slide. This triggers a transition from the current slide to the slide set, unless they are the same.
 				slide: function(index) { onSlideChange(index); },

				// Gets the total number of slides.
 				size: function() { return slides.size(); },

				// Gets the current index.
 				index: function() { return index(); },

				// Triggers a transition from the current slide to the next.
				next: function() { if (nextIndex() !== false) onSlideChange(nextIndex()); },
				
				// Triggers a transition from the current slite to the previous.
				prev: function() { if (prevIndex() !== false) onSlideChange(prevIndex()); }
				
 	        };


			// Gets the current index.
 			function index() {

				var x;

 				slides.each(function(i) {
                	if ($(this).data('index') == true) { 
 						x = i;
					}
                });

				return x;

 			};	

			// Gets the next index.
 			function nextIndex() {
				if (!api.continuous && index() === slides.size() - 1) 
					return false;
 				return (index() === slides.size() - 1) ? 0 : index() + 1;
 			};

			// Gets the previous index.
			function prevIndex() { 
				if (!api.continuous && index() === 0)
					return false;
 				return (index() === 0) ? slides.size() - 1 : index() - 1;
 			};

			

 			// Initialize -- set the object to its default state.
 			(function() {

				slides.eq(opts.index).data('index', true);

				innerContainer.css('position', 'relative');
	 			slides.css('position', 'absolute').css('top', '0').css('left', '0');

				transitions[opts.transition].init({
					options: opts.transitionOptions,
					index: opts.index, //index(),
					outerContainer: outerContainer,
					innerContainer: innerContainer,
					slides: slides,
					resourcesURI: opts.resourcesURI
				});

 			}());

			
			var locked = false;

 			function onSlideChange(newIndex) {

				// Do nothing if a transition to the current slide is requested.
				if (index() === newIndex) return;

				// Event object.
				var e = {
					index: index(),
					newIndex: newIndex
				};

                // Trigger the onSlideChange event and only do the default action if false was not returned.
                if (!locked && api.onSlideChange(e) !== false) {

            		if (opts.transition) {
	
						// TODO: Throw an exception if the transition does not exist.
	
						// Figure out whitch way the transition plays.
						var playBackwards;
						
						if (api.continuous) {
							playBackwards = (newIndex === prevIndex()) ? true : false;
						} else {
							playBackwards = (newIndex < index()) ? true : false;
						}
	
						transitions[opts.transition].transition({
							transitionTo: newIndex,
							index: index(),
							next: nextIndex(),
							prev: prevIndex(),
							playBackwards: playBackwards,
							outerContainer: outerContainer,
							innerContainer: innerContainer,
							slides: slides
						}, function() {
							locked = false;
						});

						locked = true;
			
					} else {

						// Default behaviour.
						slides.eq(e.newIndex).show();
						slides.eq(e.index).hide();
						
					}
					
					slides.data('index', false);
					slides.eq(newIndex).data('index', true);

                }

 			}

 		});



         if (opts.api) {
             // Return the API.
			// NOTE: Only the API from the last iteration gets returned.
             return api;
         } else {
             // Return the jQuery object.
             return this;
         }

   	};

})(jQuery);