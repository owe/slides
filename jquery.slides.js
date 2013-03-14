/**
 * slides | jQuery plugin
 * Copyright (C) 2013 Vecora AS
 *
 * Released under the MIT license and GNU GPLv3
 *
 * @author Erling Owe <owe@vecora.com>
 * @copyright Vecora AS, 2013
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
			onTransitionStart: function() {},
			onTransitionEnd: function() {},
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
 	            
 	            // Triggers when the transitions starts.
 	            onTransitionStart: opts.onTransitionStart,
 	            
 	            // Triggers when the transition ends.
 	            onTransitionEnd: opts.onTransitionEnd,

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

 			})();


 			// The slider is locked during a transition. This means that a new transition
			// cannot be initiated until the previous transition is complete. Attempts 
			// to change slide while the slider is locked are just ignored.
			var locked = false;


 			function onSlideChange(newIndex) {

				// Do nothing if a transition to the current slide is requested.
				if (index() === newIndex) return;

				// Event object for onSlideChange.
				var onSlideChangeEventObject = {
					index: index(),
					newIndex: newIndex
				};

                // Trigger the onSlideChange event and only do the default action if false was not returned.
                if (!locked && api.onSlideChange(onSlideChangeEventObject) !== false) {

            		if (opts.transition) {

						// TODO: Throw an exception if the transition does not exist.


						locked = true;


						// 
						function updateIndex() {
							slides.data('index', false);
							slides.eq(newIndex).data('index', true);	
						}
						
						

						function transition() {

							// Figure out which way the transition plays.
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

								var keepLocked = false;
							
								updateIndex();
							
								// Event object for onTransitionEnd.
								var onTransitionEndEventObject = {
									index: newIndex,
									keepLocked: function() {
										keepLocked = true;
									},
									slides: slides,
									unlock: function() {
										locked = false;
									}
								};
							
								
								// Trigger onTransitionEnd and pass in its event object.
								opts.onTransitionEnd(onTransitionEndEventObject);
								
								if (!keepLocked) {
									locked = false;
								}
								
							});
							
						
						}


						
						var pauseTransition = false;

						
						// Event object for onTransitionStart.
						var onTransitionStartEventObject = {
							continueTransition: function() {
								transition();
							},
							index: index(),
							pauseTransition: function() {
								pauseTransition = true;
							},
							slides: slides	
						};
						

						// Trigger onTransitionStart and pass in its event object.
						opts.onTransitionStart(onTransitionStartEventObject);


						
						if (!pauseTransition) {
							transition();
						}

						

					} else {

						// Default behaviour.
						slides.eq(onSlideChangeEventObject.newIndex).show();
						slides.eq(onSlideChangeEventObject.index).hide();
						updateIndex();

					}

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