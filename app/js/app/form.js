;( function( $, _, Backbone, Modernizr, tester, undefined ) {
	'use strict';

	var t = tester || {};

	t.init = function() {
		gc.models.question = Backbone.Model.extend( t.questionsModelCore );
		gc.app.questionsCollection = new ( Backbone.Collection.extend( t.questionsCollectionCore ) )();

		gc.models.answer = Backbone.Model.extend( t.answersModelCore );
		gc.app.answersCollection = new ( Backbone.Collection.extend( t.answersCollectionCore ) )();

		gc.app.formView = new ( Backbone.View.extend( t.formViewCore ) )( { collection : gc.app.questionsCollection } );
		// gc.app.progressBarView = new( Backbone.View.extend( t.progressBarViewCore ) )( { collection : gc.app.answersCollection } );
		gc.app.answersView = new( Backbone.View.extend( t.answersViewCore ) )( { collection : gc.app.answersCollection } );

		gc.app.localstorage = new t.localStorageController();

		gc.app.selected = {};

		t.fillQuestions();
		gc.app.formView.render();
	};

	t.fillQuestions = function() {
		// need to handle saved sessions
		var questions = [
				{
					question_name : 'name',
					question : 'What is your name?',
					answer_type : 'text',
					answers : [
						{ name : 'first_name', display : 'First Name' },
						{ name : 'last_name', display : 'Last Name' }
					]
				},

				{
					question_name : 'email',
					question : 'What is your email?',
					answer_type : 'email',
					answers : [
						{ name : 'email', display : 'Email Address' }
					]
				},

				{
					question_name : 'age',
					question : 'How old are you?',
					display : 'Age',
					answer_type : 'radio',
					answers : [
						{ name : '12_17', display : '12 to 17 years old' },
						{ name : '18', display : '18+ years old' }
					]
				},

				{
					question_name : 'grade',
					question : 'What grade are you in?',
					display : 'What grade',
					answer_type : 'radio',
					answers : [
						{ name : '6th', display : '6th grade' },
						{ name : '7th', display : '7th grade' },
						{ name : '8th', display : '8th grade' },
						{ name : 'freshmen', display : 'Freshmen' },
						{ name : 'sophomore', display : 'Sophomore' },
						{ name : 'junior', display : 'Junior' },
						{ name : 'senior', display : 'Senior' }
					],
					depends_on : {
						question_name : 'age',
						answer_names : [ '12_17' ]
					}
				},

				{
					question_name : 'status',
					question : 'You are… ?',
					display : 'Status',
					answer_type : 'radio',
					answers : [
						{ name : 'high_school_18', display : 'Still in high school' },
						{ name : 'undergrad', display : 'In college (undergrad)' },
						{ name : 'graduate', display : 'In college (graduate)' },
						{ name : 'single', display : 'Single and not in school' },
						{ name : 'married', display : 'Married' }
					],
					depends_on : {
						question_name : 'age',
						answer_names : [ '18' ]
					}
				},

				{
					question_name : 'undergrad_year',
					question : 'What year in undergrad?',
					display : 'College year',
					answer_type : 'radio',
					answers : [
						{ name : '1st', display : 'First year' },
						{ name : '2nd', display : 'Second year' },
						{ name : '3rd', display : 'Third year' },
						{ name : '4th', display : 'Fourth year' },
						{ name : '5th_plus', display : 'Fifth+ year' }
					],
					depends_on : {
						question_name : 'status',
						answer_names : [ 'undergrad' ]
					}
				},

				{
					question_name : 'phone',
					question : 'What’s your phone number?',
					answer_type : 'phone',
					answers : [
						{ name : 'phone', display : 'Phone number' }
					]
				},

				{
					question_name : 'phone_is_mobile',
					question : 'Is this a cell phone number?',
					display : 'Is cellphone',
					answer_type : 'radio',
					answers : [
						{ name : 'phone_is_mobile_yes', display : 'Yes, it’s a cell phone' },
						{ name : 'phone_is_mobile_no', display : 'No, it’s not a cell phone' }
					]
				},

				{
					question_name : 'address',
					question : 'What is your address?',
					answer_type : 'text',
					answers : [
						{ name : 'address', display : 'Address' },
						{ name : 'city', display : 'City' },
						{ name : 'state', display : 'State' },
						{ name : 'zip', display : 'Zip' }
					]
				},

				{
					question_name : 'meal_plan',
					question : 'Select the meals you would like prepared for you.',
					display : 'Meals',
					answer_type : 'meal_plan',
					answers : [
						{
							name : 'meal_plan_day_1',
							display : 'Thursday',
							date : '12/26/2013',
							meals : { breakfast : false, lunch : false, dinner : true }
						},

						{
							name : 'meal_plan_day_2',
							display : 'Friday',
							date : '12/27/2013',
							meals : { breakfast : true, lunch : true, dinner : true }
						},

						{
							name : 'meal_plan_day_3',
							display : 'Saturday',
							date : '12/28/2013',
							meals : { breakfast : true, lunch : true, dinner : true }
						},

						{
							name : 'meal_plan_day_4',
							display : 'Sunday',
							date : '12/29/2013',
							meals : { breakfast : true, lunch : true, dinner : true }
						},

						{
							name : 'meal_plan_day_4',
							display : 'Monday',
							date : '12/30/2013',
							meals : { breakfast : true, lunch : true, dinner : false }
						}
					]
				},

				{
					question_name : 'permission_slip',
					answer_type : 'info',
					answers : [
						{
							html : '<h4>You are required to have a parent or guardian read, sign, and mail a completed copy of the <a href="https://docs.google.com/document/d/1s8uqx7hFiYQ1w8OEk47tUn0tG8wwrT9uz0n7hcOkdgA" class="info-link" target="_blank">Grace 2013 Permission Slip</a> to CCLiFe, 670 Bonded Parkway, Streamwood, IL 60107.</h4>'
						}
					],
					depends_on : {
						question_name : 'age',
						answer_names : [ '12_17' ]
					}
				},

				{
					question_name : 'hotel_code_of_conduct',
					question : 'Please read & agree to the Pheasant Run Resort Code of Conduct.',
					display : 'Agreed to Code of Conduct',
					answer_type : 'agreement',
					answers : []
				},

				{
					question_name : 'toddlers',
					question : 'Are you bringing any children?',
					display : 'Bringing children',
					answer_type : 'radio',
					answers : [
						{ name : 'yes', display : 'Yes' },
						{ name : 'no', display : 'No' }
					],
					depends_on : {
						question_name : 'status',
						answer_names : [ 'single', 'married' ]
					}
				},

				{
					question_name : 'how_many_toddlers',
					question : 'How many children are you bringing?',
					answer_type : 'text',
					answers : [
						{ name : 'how_many_toddlers', display : '# of children' }
					],
					depends_on : {
						question_name : 'toddlers',
						answer_names : [ 'yes' ]
					}
				}
			],
			i;

		// building questions
		for ( i = 0; i < questions.length; i++ ) {
			gc.app.questionsCollection.add( new gc.models.question( questions[ i ] ) );
			t.fillSavedAnswer( questions[ i ] );
		}
	};

	t.fillSavedAnswer = function( question ) {
		var i,
			savedAnswer;

		if ( question.answer_type === 'text' || question.answer_type === 'email' || question.answer_type === 'phone' ) {
			for ( i = 0; i < question.answers.length; i++ ) {
				if ( savedAnswer = gc.app.localstorage.load( question.answers[ i ].name ) ) {
					gc.app.answersCollection.add( new gc.models.answer( {
						field : question.answers[ i ].name,
						value : savedAnswer,
						display : question.answers[ i ].display,
						associated_question : question.question_name
					} ) );
				}
			}
		} else if ( question.answer_type === 'radio' ) {
			if ( savedAnswer = gc.app.localstorage.load( question.question_name ) ) {
				gc.app.answersCollection.add( new gc.models.answer( {
					field : question.question_name,
					value : savedAnswer,
					display : question.display,
					associated_question : question.question_name
				} ) );
			}
		} else if ( question.answer_type === 'meal_plan' && ( savedAnswer = gc.app.localstorage.load( question.question_name ) ) ) {
			gc.app.answersCollection.add( new gc.models.answer( {
				field : question.question_name,
				value : savedAnswer,
				display : question.display,
				associated_question : question.question_name
			} ) );
		} else if ( gc.app.localstorage.load( question.question_name ) && ( question.answer_type === 'agreement' || question.answer_type === 'info' ) ) {
			gc.app.answersCollection.add( new gc.models.answer( {
				field : question.question_name,
				value : true,
				display : question.display,
				associated_question : question.question_name
			} ) );
		}
	};

	t.questionsModelCore = { // a single question
		defaults : {
			question_name : '', // question name attribute (for referrals from other questions)
			question : '', // the actual question
			answer_type : 'text', // answer input type attribute
			answers : [], // answer is in format: { name : 'input_name', display : 'A String' }. text input fields use 'display' as their placeholder text.
			depends_on : {} // question/answers that are a prereq for this question to display. format: { question_name = string, answer_names = [ strings ] }
		}
	};

	t.questionsCollectionCore = { // the collection of all questions
		initialize : function() {
			_.bindAll( this );
		},

		getFirstUnansweredQuestion : function() {
			var i;

			for ( i = 0; i < this.models.length; i++ ) {
				if (
						!gc.app.answersCollection.findWhere( { associated_question : this.models[ i ].get( 'question_name' ) } ) &&
						this.validateDependencies( this.models[ i ] )
				) {
					return this.models[ i ];
				}
			}

			return false; // all questions answered
		},

		// checks if question depends on any other questions and returns true if it does not depend on any other questions to be answered OR if the dependent questions have been answered with the correct answer
		validateDependencies : function( questionModel ) {
			var answerCurrentQuestionDependsOn = questionModel.get( 'depends_on' ),
				questionType = questionModel.get( 'answer_type' ),
				savedDependentQuestion,
				textAnswers,
				i;

			if ( answerCurrentQuestionDependsOn.answer_names ) { // this question depends on another question to be answered
				if ( questionType === 'text' ) {
					savedDependentQuestion = gc.app.answersCollection.findWhere( { field : answerCurrentQuestionDependsOn.question_name } );
				} else if ( questionType === 'email' || questionType === 'phone' ) {
					textAnswers = questionModel.get( 'answers' );

					for ( i = 0; i < textAnswers.length; i++ ) {
						if ( answerCurrentQuestionDependsOn.question_name = textAnswers[ i ].name ) {
							savedDependentQuestion = gc.app.answersCollection.findWhere( { field : textAnswers[ i ].name } );
							break;
						}
					}
				} else if ( questionType === 'radio' ) {
					savedDependentQuestion = gc.app.answersCollection.findWhere( { field : answerCurrentQuestionDependsOn.question_name } ); // the dependent question that we've saved
				} else if ( questionType === 'info' ) {
					savedDependentQuestion = gc.app.answersCollection.findWhere( { field : answerCurrentQuestionDependsOn.question_name } );
				}

				return ( savedDependentQuestion && $.inArray( savedDependentQuestion.get( 'value' ), answerCurrentQuestionDependsOn.answer_names ) !== -1 ) ? true : false;
			}

			return true;
		}
	};

	t.answerModelCore = { // an answer to a question
		defaults : {
			field : '', // corresponding to the saved key,
			display : '', // display value of key
			value : undefined, // the answer
			associated_question : '' // question_name
		}
	};

	t.answersCollectionCore = { // collection of all answers

	};

	t.formViewCore = {
		id : 'form',
		events : {
			'submit form' : 'processAnswer',
			'click .input-radio' : 'processAnswer',
			'click .js-meal-plan-select-all' : 'allMeals'
		},

		initialize : function() {
			_.bindAll( this );

			this.collection.on( 'reset', this.render );
		},

		render : function() {
			var questionModel = gc.app.selected.question = this.collection.getFirstUnansweredQuestion();

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#view-container' );
			}

			if ( !questionModel ) { // all questions are answered
				this.renderCheckAnswers();
			} else {
				this.renderQuestion( questionModel.toJSON() );
			}
		},

		renderQuestion : function( stache ) {
			stache[ stache.answer_type ] = true;

			this.$el.empty().
				append( gc.template( 'question', stache ) ).
				find( 'input[type="text"], input[type="email"], input[type="tel"]' ).first().focus();
		},

		renderCheckAnswers : function() {
			this.remove();

			gc.app.answersView.render();
		},

		processAnswer : function() {
			var invalidInputTypes = [ 'radio', 'checkbox' ],
				$input;

			if ( this.validateAnswer() ) {
				this.saveAnswer().render();
			} else {
				$input = this.$el.find( 'input' ).first();
				this.$el.find( '.alert' ).show();

				if ( $.inArray( $input[ 0 ].type, invalidInputTypes ) === -1 ) {
					$input.focus();
				}
			}

			return false;
		},

		validateAnswer : function() {
			var answerType = gc.app.selected.question.get( 'answer_type' ),
				genericValidate = function() { return true ; },
				validationFunctions = {
					text : this.validateTextAnswers,
					email : this.validateTextAnswers,
					phone : this.validatePhone,
					meal_plan : this.validateMeals,
					agreement : genericValidate,
					info : genericValidate
				};

			if ( validationFunctions[ answerType ] ) {
				return validationFunctions[ answerType ]();
			}

			return true;
		},

		validateTextAnswers : function() {
			var $inputEls = this.$el.find( 'input' ),
				i;

			for ( i = 0; i < $inputEls.length; i++ ) {
				if ( _.isEmpty( $.trim( $inputEls[ i ].value ) ) ) {
					return false;
				}
			}

			return true;
		},

		validatePhone : function() {
			var phoneNumber = this.$el.find( 'input[type="tel"]' ).val();

			return this.trimPhoneValue( phoneNumber ).length === 10;
		},

		validateMeals : function() {
			var $checkedBoxes = this.$el.find( '.input-checkbox:checked' ).filter( function() {
					return this.id !== 'meal-plan-select-all-checkbox';
				} );

			if ( $checkedBoxes.length === 0 ) {
				return window.confirm( 'Are you sure you don’t want to register for any meals? (Click OK if you are sure)');
			}

			return true;
		},

		trimPhoneValue : function( initialValue ) {
			var phoneNumber = $.trim( initialValue );
			phoneNumber = phoneNumber.replace( /(\()|(\))|(-)|(\.)|(\s)/gi, '' );
			phoneNumber = parseInt( phoneNumber, 10 ).toString();

			if ( phoneNumber[ 0 ] === '1' ) {
				phoneNumber = phoneNumber.substring( 1 );
			}

			return phoneNumber;
		},

		saveAnswer : function() {
			var rawAnswers = [],
				answersFormattedForCollection = [],
				answerType = gc.app.selected.question.get( 'answer_type' ),
				genericAnswerFunc = function() {
					var question = gc.app.selected.question;

					return [ {
						field : question.attributes.question_name,
						value : true,
						display : question.attributes.display,
						associated_question : question.attributes.question_name
					} ];
				},
				rawAnswerMap = {
					text : this.generateTextAnswers,
					radio : this.generateRadioAnswers,
					email : this.generateTextAnswers,
					phone : this.generatePhoneAnswers,
					meal_plan : this.generateMealAnswers,
					agreement : genericAnswerFunc,
					info : genericAnswerFunc
				},
				i;

			rawAnswerMap[ answerType ] && ( rawAnswers = rawAnswerMap[ answerType ]() );

			for ( i = 0; i < rawAnswers.length; i++ ) {
				this.addAnswer( rawAnswers[ i ], answersFormattedForCollection );
				gc.app.localstorage.save( rawAnswers[ i ].field, rawAnswers[ i ].value );
			}
			gc.app.answersCollection.add( answersFormattedForCollection );

			return this;
		},

		generateTextAnswers : function() {
			var i,
				answerEls,
				storeAnswers = [];

			answerEls = this.$el.find( 'input' );
			for ( i = 0; i < answerEls.length; i++ ) {
				storeAnswers.push( {
					field : answerEls[ i ].name,
					value : answerEls[ i ].value,
					display : gc.app.selected.question.get( 'answers' )[ i ].display,
					associated_question : gc.app.selected.question.get( 'question_name' )
				} );
			}

			return storeAnswers;
		},

		generatePhoneAnswers : function() {
			var i,
				answerEls,
				storeAnswers = [];

			answerEls = this.$el.find( 'input' );
			for ( i = 0; i < answerEls.length; i++ ) {
				storeAnswers.push( {
					field : answerEls[ i ].name,
					value : this.trimPhoneValue( answerEls[ i ].value ),
					display : gc.app.selected.question.get( 'answers' )[ i ].display,
					associated_question : gc.app.selected.question.get( 'question_name' )
				} );
			}

			return storeAnswers;
		},

		generateRadioAnswers : function() {
			var answerRadio = this.$el.find( 'input:checked' ),
				answerData = _.find( gc.app.selected.question.get( 'answers' ), function( answer ) {
					return answer.name === answerRadio.val();
				} ),
				questionName = gc.app.selected.question.get( 'question_name' ),
				questionDisplay = gc.app.selected.question.get( 'display' );

			return [ {
				field : questionName,
				value : answerData.name,
				display : questionDisplay,
				associated_question : questionName
			} ];
		},

		generateMealAnswers : function() {
			var questionName = gc.app.selected.question.get( 'question_name' ),
				$checkedBoxes = this.$el.find( '.input-checkbox:checked' ).filter( function() {
					return this.id !== 'meal-plan-select-all-checkbox';
				} ),
				meals = {
					meal_plan_day_1 : { dinner : false },
					meal_plan_day_2 : { breakfast : false, lunch : false, dinner : false },
					meal_plan_day_3 : { breakfast : false, lunch : false, dinner : false },
					meal_plan_day_4 : { breakfast : false, lunch : false, dinner : false },
					meal_plan_day_5 : { breakfast : false, lunch : false }
				},
				checkboxStr, i;

			for ( i = 0; i < $checkedBoxes.length; i++ ) {
				checkboxStr = $checkedBoxes[ i ].name.split( '_' );
				meals[ 'meal_plan_day_' + checkboxStr[ 3 ] ][ checkboxStr[ 4 ] ] = true;
			}

			return [ {
				field : questionName,
				value : JSON.stringify( meals ),
				display : gc.app.selected.question.get( 'display' ),
				associated_question : questionName
			} ];
		},

		addAnswer : function( rawAnswer, collectedAnswers ) {
			var existingAnswer;

			if ( existingAnswer = gc.app.answersCollection.findWhere( { field : rawAnswer.field } ) ) {
				existingAnswer.set( 'value', rawAnswer.value );
			} else {
				collectedAnswers.push( new gc.models.answer( rawAnswer ) );
			}
		},

		allMeals : function( ev ) {
			var $allMealsCheckbox = $( ev.currentTarget ),
				$allCheckboxes = this.$el.find( '.input-checkbox' ).filter( function() {
					return this.id !== 'meal-plan-select-all-checkbox';
				} );

			$allCheckboxes.prop( 'checked', $allMealsCheckbox.is( ':checked' ) );

			return true;
		}
	};

	t.answersViewCore = {
		className : 'answers',
		events : {
			'click .js-correct' : 'processForm',
			'click .js-incorrect' : 'resetForm'
		},

		initialize : function() {
			_.bindAll( this );
		},

		render : function() {
			this.$el.empty().append( gc.template( 'answers', this.generateTemplateVars() ) );

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#view-container' );
			}
		},

		resetForm : function() {
			this.$el.
				remove().
				empty();

			gc.app.localstorage.clear();
			gc.app.answersCollection.reset();

			return false;
		},

		generateTemplateVars : function() {
			var rawAnswers = this.collection.toJSON(),
				questions = gc.app.questionsCollection.toJSON(),
				findQuestion = function( question ) { return question.question_name === tempAnswer.associated_question; },
				genericGenerateAnswer = function( answer ) {
					return { display : answer.display, value : answer.value };
				},
				answerTypeToGenerate = {
					text : genericGenerateAnswer,
					email : genericGenerateAnswer,
					phone : genericGenerateAnswer,
					radio : this.generateRadioAnswer,
					meal_plan : this.generateMealAnswer
				},
				stache = {
					answers : []
				},
				tempAnswer, i, tempQuestion;

			for ( i = 0; i < rawAnswers.length; i++ ) {
				tempAnswer = rawAnswers[ i ];
				tempQuestion = _.find( questions, findQuestion );

				if ( answerTypeToGenerate[ tempQuestion.answer_type ] ) {
					stache.answers.push( answerTypeToGenerate[ tempQuestion.answer_type ]( tempAnswer, tempQuestion ) );
				}
			}

			return stache;
		},

		generateRadioAnswer : function( answer, question ) {
			var i;

			for ( i = 0; i < question.answers.length; i++ ) {
				if ( question.answers[ i ].name === answer.value ) {
					return { display : question.display, value : question.answers[ i ].display };
				}
			}
		},

		generateMealAnswer : function( answer, question ) {
			var registeredMeals = JSON.parse( answer.value ),
				stringArr = [],
				i, registeredMealsForDay, tempString, tempStringArr;

			for ( i = 0; i < question.answers.length; i++ ) {
				registeredMealsForDay = registeredMeals[ question.answers[ i ].name ];

				tempString = question.answers[ i ].display +' ('+ question.answers[ i ].date +'): ';
				tempStringArr = [];

				if ( registeredMealsForDay.breakfast || registeredMealsForDay.lunch || registeredMealsForDay.dinner ) {
					registeredMealsForDay.breakfast && tempStringArr.push( 'breakfast' );
					registeredMealsForDay.lunch && tempStringArr.push( 'lunch' );
					registeredMealsForDay.dinner && tempStringArr.push( 'dinner' );

					tempString += tempStringArr.join( ', ' ) + '.';
					stringArr.push( tempString );
				}
			}

			return { display : question.display, value : stringArr.join( '<br>' ) };
		},

		reset : function() {
			this.$el.empty();
		}
	};

	// t.progressBarViewCore = {
	// 	el : '#progress',

	// 	initialize : function() {
	// 		_.bindAll( this );

	// 		this.collection.on( 'add', this.render );
	// 		this.collection.on( 'change', this.render );
	// 		this.collection.on( 'reset', this.reset );
	// 	},

	// 	render : function() {
	// 		this.$el.
	// 			show().
	// 			find( '.bar' ).css( 'width', this.getPercentageComplete() + '%' );
	// 	},

	// 	getPercentageComplete : function() {
	// 		return 100; // TO DO
	// 	},

	// 	reset : function() {
	// 		this.$el.hide();
	// 	}
	// };

	t.localStorageController = function() {
		this.save = function( key, value ) {
			if ( Modernizr.localstorage ) {
				window.localStorage.setItem( key, value );
				return true;
			}

			return false;
		};

		this.load = function( key ) {
			if ( Modernizr.localstorage ) {
				return window.localStorage.getItem( key );
			}

			return undefined;
		};

		this.clear = function() {
			if ( Modernizr.localstorage ) {
				window.localStorage.clear();
			}

			return false;
		};
	};

	gc.init( function() {
		t.init();
	} );
} )( jQuery, _, Backbone, Modernizr, tester );
