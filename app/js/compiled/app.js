;( function( $, _, Backbone, Modernizr, tester, gc, undefined ) {
	'use strict';

	var t = tester || {};

	t.init = {
		initialize : function() {
			var attendeeId;

			_.bindAll( t.init );

			gc.models.question = Backbone.Model.extend( t.questionsModelCore );
			gc.app.questionCollection = new ( Backbone.Collection.extend( t.questionCollectionCore ) )();

			gc.models.answer = Backbone.Model.extend( t.answerModelCore );
			gc.collections.answer = Backbone.Collection.extend( t.answerCollectionCore );

			gc.models.attendee = Backbone.Model.extend( t.attendeeModelCore );
			gc.app.attendeeCollection = new ( Backbone.Collection.extend( t.attendeeCollectionCore ) )();

			gc.app.formView = new ( Backbone.View.extend( t.formViewCore ) )( { collection : gc.app.questionCollection } );
			// gc.app.progressBarView = new ( Backbone.View.extend( t.progressBarViewCore ) )();
			gc.app.reviewView = new ( Backbone.View.extend( t.reviewViewCore ) )();

			gc.models.payment = Backbone.Model.extend( t.paymentModelCore );
			gc.app.paymentView = new ( Backbone.View.extend( t.paymentViewCore ) )();

			gc.app.completionView = new ( Backbone.View.extend( t.completionViewCore ) )();

			gc.app.localstorage = new t.localStorageController();

			gc.app.selected = {};
			gc.app.resetForm = this.resetForm;

			this.fillQuestions();
			this.fillSavedAttendeeAnswers();

			if ( attendeeId = ( gc.app.attendee_id || gc.app.localstorage.load( 'attendee_id' ) ) ) {
				$.get( '/api/get/check_payment_made', { attendee_id : attendeeId } ).done( function( response ) {
					if ( response.paid ) {
						gc.app.completionView.render();
					} else {
						gc.app.formView.render();
					}
				} );
			} else {
				gc.app.formView.render();
			}

			// gc.app.mealCostModel.calculateTotalCostFromSavedAnswer();
		},

		fillQuestions : function() {
			// need to handle saved sessions
			var questions = [
					{
						question_name : 'number_of_attendees',
						question : 'How many attendees are you registering for Grace 2013?',
						answer_type : 'number_of_attendees',
						answers : [
							{ name : 'number_of_attendees', display : '# of attendees' }
						]
					},

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
							{ name : 'email', display : 'Email' }
						]
					},

					{
						question_name : 'age',
						question : 'How old are you?',
						display : 'Age',
						answer_type : 'radio',
						answers : [
							{ name : '11', display : '11 and under' },
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
							{ name : '1st', display : '1st grade' },
							{ name : '2nd', display : '2nd grade' },
							{ name : '3rd', display : '3rd grade' },
							{ name : '4th', display : '4th grade' },
							{ name : '5th', display : '5th grade' },
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
							answer_names : [ '11', '12_17' ]
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
							{ name : 'phone', display : 'Phone' }
						]
					},

					{
						question_name : 'phone_is_mobile',
						question : 'Is this a cell phone number?',
						display : 'Is cellphone',
						answer_type : 'radio',
						answers : [
							{ name : 'yes', display : 'Yes, it’s a cell phone' },
							{ name : 'no', display : 'No, it’s not a cell phone' }
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
								name : 'meal_plan_day_5',
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
							answer_names : [ '11', '12_17' ]
						}
					},

					{
						question_name : 'hotel_code_of_conduct',
						question : 'Please read & agree to the Pheasant Run Resort Code of Conduct.',
						display : 'Agreed to Code of Conduct',
						answer_type : 'agreement',
						answers : []
					}
				],
				i;

			for ( i = 0; i < questions.length; i++ ) { // building questions
				gc.app.questionCollection.add( new gc.models.question( questions[ i ] ) );
			}
		},

		fillSavedAttendeeAnswers : function() {
			var numberOfAttendees = gc.app.localstorage.load( 'number_of_attendees' ),
				i, j;

			if ( !numberOfAttendees ) {
				return false;
			}

			for ( i = 0; i < numberOfAttendees; i++ ) {
				gc.app.attendeeCollection.add( new gc.models.attendee( { storage_prefix : 'attendee_' + i, all_questions_completed : gc.app.localstorage.load( 'attendee_' + i +'.'+ 'all_questions_completed' ) } ) );
			}

			for ( i = 0; i < gc.app.questionCollection.length; i++ ) {
				for ( j = 0; j < gc.app.attendeeCollection.length; j++ ) {
					this.fillSavedAnswer( gc.app.questionCollection.models[ i ].attributes, gc.app.attendeeCollection.models[ j ] );
				}
			}

			gc.app.attendeeCollection.fillLimboAnswers();
		},

		fillSavedAnswer : function( question, attendee ) {
			var i,
				savedAnswer;

			if ( question.answer_type === 'text' || question.answer_type === 'email' || question.answer_type === 'phone' ) {
				for ( i = 0; i < question.answers.length; i++ ) {
					if ( savedAnswer = gc.app.localstorage.load( attendee.attributes.storage_prefix +'.'+ question.answers[ i ].name ) ) {
						attendee.answerCollection.add( new gc.models.answer( {
							field : question.answers[ i ].name,
							value : savedAnswer,
							display : question.answers[ i ].display,
							associated_question : question.question_name
						} ) );
					}
				}
			} else if (
					( question.answer_type === 'radio' || question.answer_type === 'meal_plan' ) &&
					( savedAnswer = gc.app.localstorage.load( attendee.attributes.storage_prefix +'.'+ question.question_name ) )
			) {
				attendee.answerCollection.add( new gc.models.answer( {
					field : question.question_name,
					value : savedAnswer,
					display : question.display,
					associated_question : question.question_name
				} ) );
			} else if ( gc.app.localstorage.load( attendee.attributes.storage_prefix +'.'+ question.question_name ) && ( question.answer_type === 'agreement' || question.answer_type === 'info' ) ) {
				attendee.answerCollection.add( new gc.models.answer( {
					field : question.question_name,
					value : true,
					display : question.display,
					associated_question : question.question_name
				} ) );
			}
		},

		resetForm : function() {
			gc.app.localstorage.clear();

			return $.post( '/api/set/reset_registration' ).done( function() {
				gc.app.session = {};
				gc.app.attendeeCollection.reset();
			} );
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

	t.questionCollectionCore = { // the collection of all questions
	};

	t.attendeeModelCore = {
		defaults : {
			all_questions_completed : false,
			storage_prefix : undefined,
			selected : false
		},

		initialize : function() {
			_.bindAll( this );

			this.paymentModel = new gc.models.payment( this );
			this.answerCollection = new gc.collections.answer( undefined, undefined, this ); // the confirmed answers
			this.limboAnswerCollection = new gc.collections.answer( undefined, undefined, this ); // we're not confirming any of these answers yet. going to autofill the inputs even though they're inheriting answers from parents rather than skipping the questions.

			this.on( 'change:all_questions_completed', this.save );
		},

		getFirstUnansweredQuestion : function() {
			var questionsToSkip = [ 'number_of_attendees', 'hotel_code_of_conduct' ],
				i;

			for ( i = 0; i < gc.app.questionCollection.length; i++ ) {
				if (
						$.inArray( gc.app.questionCollection.models[ i ].attributes.question_name, questionsToSkip ) === -1 &&
						!this.answerCollection.findWhere( { associated_question : gc.app.questionCollection.models[ i ].attributes.question_name } ) &&
						this.validateDependencies( gc.app.questionCollection.models[ i ] )
				) {
					return gc.app.questionCollection.models[ i ];
				}
			}

			return false;
		},

		// checks if question depends on any other questions and returns true if it does not depend on any other questions to be answered OR if the dependent questions have been answered with the correct answer
		validateDependencies : function( questionModel ) {
			var answerCurrentQuestionDependsOn = questionModel.get( 'depends_on' ),
				questionType = questionModel.get( 'answer_type' ),
				savedDependentQuestion,
				textAnswers,
				i;

			if ( answerCurrentQuestionDependsOn.answer_names ) { // this question depends on another question to be answered
				if ( questionType === 'text' || questionType === 'radio' || questionType === 'info' ) {
					savedDependentQuestion = this.answerCollection.findWhere( { field : answerCurrentQuestionDependsOn.question_name } );
				} else if ( questionType === 'email' || questionType === 'phone' ) {
					textAnswers = questionModel.get( 'answers' );

					for ( i = 0; i < textAnswers.length; i++ ) {
						if ( answerCurrentQuestionDependsOn.question_name = textAnswers[ i ].name ) {
							savedDependentQuestion = this.answerCollection.findWhere( { field : textAnswers[ i ].name } );
							break;
						}
					}
				}

				return ( savedDependentQuestion && $.inArray( savedDependentQuestion.get( 'value' ), answerCurrentQuestionDependsOn.answer_names ) !== -1 ) ? true : false;
			}

			return true;
		},

		resetForm : function() {
			var prefix = this.attributes.storage_prefix,
				i;

			for ( i = 0; i < this.answerCollection.length; i++ ) {
				gc.app.localstorage.remove( prefix +'.'+ this.answerCollection.models[ i ].attributes.field );
			}

			this.answerCollection.reset();
			this.set( 'all_questions_completed', false );
			gc.app.formView.render();
		},

		save : function() {
			gc.app.localstorage.save( this.attributes.storage_prefix +'.'+ 'all_questions_completed', true );
		}
	};

	t.attendeeCollectionCore = {
		initialize : function() {
			_.bindAll( this );

			this.on( 'add', this.selectFirstIncompleteAttendee );
			this.on( 'change', this.selectFirstIncompleteAttendee );
			this.on( 'change:all_questions_completed', this.fillLimboAnswers );
		},

		selectFirstIncompleteAttendee : function() {
			var firstIncompleteAttendee = this.findWhere( { all_questions_completed : false } ),
				otherAttendees,
				i;

			if ( !firstIncompleteAttendee ) {
				return false;
			}

			otherAttendees = this.without( firstIncompleteAttendee );
			for ( i = 0; i < otherAttendees.length; i++ ) {
				otherAttendees[ i ].set( 'selected', false );
			}

			firstIncompleteAttendee.set( 'selected', true );
			gc.app.selected.attendee = firstIncompleteAttendee;
			return firstIncompleteAttendee;
		},

		fillLimboAnswers : function() {
			var answersToInherit = [ 'last_name', 'email', 'phone', 'address', 'city', 'state', 'zip' ],
				answersToClone = this.models[ 0 ].answerCollection.toJSON(),
				i, j;

			if ( this.length < 2 ) {
				return;
			}

			for ( i = 0; i < answersToClone.length; i++ ) {
				if ( $.inArray( answersToClone[ i ].field, answersToInherit ) !== -1 ) {
					for ( j = 1; j < this.length; j++ ) {
						this.models[ j ].limboAnswerCollection.add( new gc.models.answer( answersToClone[ i ] ) );
					}
				}
			}
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

	t.answerCollectionCore = { // collection of all answers
		initialize : function( models, options, attendeeModel ) {
			_.bindAll( this );
			this.attendeeModel = attendeeModel;
		},

		processForm : function() {
			return $.ajax( '/api/set/attendee_registration/', {
				data : {
					value : this.toJSON()
				},
				timeout : 10000,
				type : 'POST'
			} );
		}
	};

	t.formViewCore = {
		id : 'form',
		events : {
			'submit form' : 'processAnswer',
			'click .input-radio' : 'processAnswer',
			'click .js-meal-plan-select-all' : 'allMeals',
			'click .js-reset-form' : 'resetForm',
			'click .js-reset-form-for-attendee' : 'resetFormForCurrentAttendee',
			'click .js-meal-checkbox' : 'calculateMealCost'
		},

		initialize : function() {
			_.bindAll( this );

			gc.app.attendeeCollection.on( 'reset', this.render );
			gc.app.attendeeCollection.on( 'change', this.render );
		},

		render : function() {
			var selectedAttendee,
				questionModel;

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#view-container' );
			}

			if ( gc.app.attendeeCollection.length === 0 ) { // render first question to spawn attendees
				questionModel = gc.app.selected.question = gc.app.questionCollection.findWhere( { question_name : 'number_of_attendees' } );
			} else { // render first unanswered question for selected attendee
				selectedAttendee = gc.app.selected.attendee;

				if ( !selectedAttendee ) {
					this.renderCheckAnswers();
					return;
				}

				questionModel = gc.app.selected.question = selectedAttendee.getFirstUnansweredQuestion();
			}

			if ( !questionModel ) { // all questions are answered
				this.renderCheckAnswers();
			} else {
				this.renderQuestion( questionModel.toJSON(), selectedAttendee );

				if ( selectedAttendee && selectedAttendee.answerCollection.length > 0 ) {
					this.$el.find( '.extras-container' ).css( 'visibility', 'visible' );
				}
			}
		},

		renderQuestion : function( stache, selectedAttendee ) {
			var i,
				limboAnswer,
				name;

			stache[ stache.answer_type ] = true;

			if ( selectedAttendee ) {
				name = selectedAttendee.answerCollection.findWhere( { field : 'first_name' } );
				if ( name ) {
					name = name.attributes.value;
				} else {
					for ( i = 0; i < gc.app.attendeeCollection.length; i++ ) {
						if ( gc.app.attendeeCollection.models[ i ].cid === selectedAttendee.cid ) {
							name = 'Attendee #' + ( i + 1 );
							i = gc.app.attendeeCollection.length;
						}
					}
				}

				if ( gc.app.attendeeCollection.length > 1 ) {
					stache.more_than_one_attendee = true;
				}

				stache.attendee = {
					attendee_name : name
				};

				for ( i = 0; i < stache.answers.length; i++ ) {
					limboAnswer = selectedAttendee.limboAnswerCollection.findWhere( { field : stache.answers[ i ].name } );
					if ( limboAnswer ) {
						stache.answers[ i ].value = limboAnswer.attributes.value;
					}
				}
			}

			this.$el.empty().
				append( gc.template( 'question', stache ) ).
				find( 'input[type="text"], input[type="email"], input[type="tel"]' ).first().focus();
		},

		renderCheckAnswers : function() {
			this.$el.detach();

			gc.app.reviewView.render();
		},

		processAnswer : function() {
			if ( this.validateAnswer() ) {
				this.saveAnswer().render();
			} else {
				this.$el.find( '.alert' ).show();
			}

			return false;
		},

		validateAnswer : function() {
			var answerType = gc.app.selected.question.get( 'answer_type' ),
				genericValidate = function() { return true ; },
				validationFunctions = {
					number_of_attendees : this.validateNumberOfAttendees,
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

		validateNumberOfAttendees : function() {
			var $inputEls = this.$el.find( 'input' ),
				intValue,
				i;

			for ( i = 0; i < $inputEls.length; i++ ) {
				intValue = parseInt( $.trim( $inputEls[ i ].value ), 10 );
				if ( !_.isNumber( intValue ) || _.isNaN( intValue ) ) {
					$( $inputEls[ i ] ).focus();
					return false;
				}
			}

			return true;
		},

		validateTextAnswers : function() {
			var $inputEls = this.$el.find( 'input' ),
				i;

			for ( i = 0; i < $inputEls.length; i++ ) {
				if ( _.isEmpty( $.trim( $inputEls[ i ].value ) ) ) {
					$( $inputEls[ i ] ).focus();
					return false;
				}
			}

			return true;
		},

		validatePhone : function() {
			var $phone = this.$el.find( 'input[type="tel"]' ),
				phoneNumber = $phone.val();

			if ( this.trimPhoneValue( phoneNumber ).length !== 10 ) {
				$phone.focus();
				return false;
			}

			return true;
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
					number_of_attendees : this.generateAttendees,
					text : this.generateTextAnswers,
					radio : this.generateRadioAnswers,
					email : this.generateTextAnswers,
					phone : this.generatePhoneAnswers,
					meal_plan : this.generateMealAnswers,
					agreement : genericAnswerFunc,
					info : genericAnswerFunc
				},
				selectedAttendee = gc.app.attendeeCollection.findWhere( { selected : true } ),
				i;

			rawAnswerMap[ answerType ] && ( rawAnswers = rawAnswerMap[ answerType ]() );

			for ( i = 0; i < rawAnswers.length; i++ ) {
				this.addAnswer( rawAnswers[ i ], answersFormattedForCollection, selectedAttendee.answerCollection );
				gc.app.localstorage.save( selectedAttendee.attributes.storage_prefix +'.'+ rawAnswers[ i ].field, rawAnswers[ i ].value );
			}
			selectedAttendee && ( selectedAttendee.answerCollection.add( answersFormattedForCollection ) );

			return this;
		},

		generateAttendees : function () {
			var numberOfAttendees = parseInt( $.trim( this.$el.find( 'input' )[ 0 ].value ), 10 ),
				i;

			for ( i = 0; i < numberOfAttendees; i++ ) {
				gc.app.attendeeCollection.add( new gc.models.attendee( { storage_prefix : 'attendee_' + i } ) );
			}

			gc.app.localstorage.save( 'number_of_attendees', numberOfAttendees );

			return [];
		},

		generateTextAnswers : function() {
			var i,
				answerEls = this.$el.find( 'input' ),
				storeAnswers = [];

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

		addAnswer : function( rawAnswer, collectedAnswers, answerCollection ) {
			var existingAnswer;

			if ( existingAnswer = answerCollection.findWhere( { field : rawAnswer.field } ) ) {
				existingAnswer.set( 'value', rawAnswer.value );
			} else {
				collectedAnswers.push( new gc.models.answer( rawAnswer ) );
			}
		},

		allMeals : function( ev ) {
			var $allMealsCheckbox = $( ev.currentTarget ),
				$allCheckboxes = this.$el.find( '.js-meal-checkbox' );

			$allCheckboxes.prop( 'checked', $allMealsCheckbox.is( ':checked' ) );
			this.calculateMealCost();

			return true;
		},

		resetForm : function() {
			gc.app.resetForm();
			return false;
		},

		resetFormForCurrentAttendee : function() {
			gc.app.selected.attendee.resetForm();
		},

		calculateMealCost : function() {
			var $allCheckboxes = this.$el.find( '.js-meal-checkbox:checked' ),
				mealFuncs = { breakfast : 'addBreakfast', lunch : 'addLunch', dinner : 'addDinner' },
				i;

			gc.app.selected.attendee.paymentModel.resetCosts();

			for ( i = 0; i < $allCheckboxes.length; i++ ) {
				gc.app.selected.attendee.paymentModel[ mealFuncs[ $( $allCheckboxes[ i ] ).data( 'type' ) ] ]();
			}

			this.$el.find( '.meal-cost-container' ).css( 'visibility', 'visible' ).
				find( '.meal-cost' ).empty().append( gc.app.selected.attendee.paymentModel.get( 'total_cost' ) );
		}
	};

	t.reviewViewCore = {
		className : 'answers',
		events : {
			'click .js-correct' : 'processForm',
			'click .js-reset-form' : 'resetForm',
			'click .js-reset-form-for-attendee' : 'resetFormForCurrentAttendee'
		},

		initialize : function() {
			_.bindAll( this );
		},

		render : function() {
			if ( !gc.app.attendeeCollection.findWhere( { all_questions_completed : false } ) ) {
				gc.app.paymentView.render();
				return;
			}

			this.$el.empty().append( gc.template( 'answers', this.generateTemplateVars() ) );

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#view-container' );
			}
		},

		resetForm : function() {
			var self = this;

			gc.app.resetForm().done( function() {
				self.$el.detach().empty();
			} );

			return false;
		},

		resetFormForCurrentAttendee : function() {
			gc.app.selected.attendee.resetForm();
		},

		processForm : function() {
			// this.$el.find( '.js-correct' ).empty().append( 'Processing…' ).
				// prop( 'disabled', true );

			gc.app.selected.attendee.set( 'all_questions_completed', true );
			this.$el.detach().empty();

			if ( !gc.app.attendeeCollection.findWhere( { all_questions_completed : false } ) ) {
			}

			// gc.app.answerCollection.processForm().
			// 	done( this.transitionToPayment ).
			// 	fail( this.submissionError );

			return false;
		},

		transitionToPayment : function( response ) {
			if ( response.status !== 'success' ) {
				this.submissionError();
				return;
			}

			gc.app.localstorage.save( 'form_completed_id', response.id );
			gc.app.attendee_id = response.id;

			this.$el.detach();

			gc.app.paymentView.render();
		},

		submissionError : function() {
			var $error = this.$el.find( '#error-modal' );

			this.$el.find( '.js-correct' ).empty().append( 'Yes, It’s Correct' ).
				prop( 'disabled', false );

			$error.find( '.btn' ).on( 'click', function() {
				$error.modal( 'hide' );

				$( this ).off( 'click' );
			} );
			$error.modal();
		},

		generateTemplateVars : function() {
			var rawAnswers = gc.app.selected.attendee.answerCollection.toJSON(),
				questions = gc.app.questionCollection.toJSON(),
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
					answers : [],
					more_than_one_attendee : gc.app.attendeeCollection.length > 1,
					attendee : { attendee_name : gc.app.selected.attendee.answerCollection.findWhere( { field : 'first_name' } ).attributes.value }
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

	t.paymentModelCore = {
		defaults : {
			registration_cost : 0,
			cost_from_breakfast : 0,
			cost_from_lunch : 0,
			cost_from_dinner : 0,
			total_cost : 0
		},

		initialize : function( attendeeModel ) {
			_.bindAll( this );
			this.attendeeModel = attendeeModel;

			this.on( 'change:cost_from_breakfast', this.calculateTotalCost );
			this.on( 'change:cost_from_lunch', this.calculateTotalCost );
			this.on( 'change:cost_from_dinner', this.calculateTotalCost );
			this.on( 'change:registration_cost', this.calculateTotalCost );
		},

		setRegistrationCost : function() {
			var dateCutoffs = {
					early : ( new Date( 'Sun Sep 15 2013 23:59:59 GMT-0500 (CDT)' ) ).getTime(),
					regular : ( new Date( 'Fri Nov 15 2013 23:59:59 GMT-0500 (CDT)' ) ).getTime(),
					late : ( new Date( 'Tue Dec 10 2013 23:59:59 GMT-0500 (CDT)' ) ).getTime()
				},
				now = Date.now(),
				cost;

			if ( this.attendeeModel.answerCollection.findWhere( { field : 'age' } ).attributes.value === '11' ) {
				cost = 0;
			} else if ( now <= dateCutoffs.early ) {
				cost = 10;
			} else if ( now <= dateCutoffs.regular ) {
				cost = 15;
			} else {
				cost = 25;
			}

			this.set( 'registration_cost', cost );
			return cost;
		},

		addBreakfast : function() {
			this.set( 'cost_from_breakfast', this.attributes.cost_from_breakfast + 5 );
		},

		addLunch : function() {
			this.set( 'cost_from_lunch', this.attributes.cost_from_lunch + 7 );
		},

		addDinner : function() {
			this.set( 'cost_from_dinner', this.attributes.cost_from_dinner + 8 );
		},

		calculateTotalCostFromSavedAnswer : function() {
			var savedMeals = this.attendeeModel.answerCollection.find( function( model ) { return model.attributes.field === 'meal_plan'; } );

			if ( !savedMeals ) {
				return false;
			}

			this.resetCosts();

			savedMeals = JSON.parse( savedMeals.attributes.value );
			savedMeals.meal_plan_day_1.dinner && this.addDinner();
			savedMeals.meal_plan_day_2.breakfast && this.addBreakfast();
			savedMeals.meal_plan_day_2.lunch && this.addLunch();
			savedMeals.meal_plan_day_2.dinner && this.addDinner();
			savedMeals.meal_plan_day_3.breakfast && this.addBreakfast();
			savedMeals.meal_plan_day_3.lunch && this.addLunch();
			savedMeals.meal_plan_day_3.dinner && this.addDinner();
			savedMeals.meal_plan_day_4.breakfast && this.addBreakfast();
			savedMeals.meal_plan_day_4.lunch && this.addLunch();
			savedMeals.meal_plan_day_4.dinner && this.addDinner();
			savedMeals.meal_plan_day_5.breakfast && this.addBreakfast();
			savedMeals.meal_plan_day_5.lunch && this.addLunch();
		},

		calculateTotalCost : function() {
			this.set( 'total_cost', this.attributes.registration_cost + this.attributes.cost_from_breakfast + this.attributes.cost_from_lunch + this.attributes.cost_from_dinner );
		},

		resetCosts : function() {
			this.set( { cost_from_breakfast : 0, cost_from_lunch : 0, cost_from_dinner : 0, total_cost : 0 } );
		}
	};

	t.paymentViewCore = {
		events : {
			'click .js-pay' : 'proceedWithPayment',
			'click .js-reset-form' : 'resetForm'
		},

		initialize : function() {
			_.bindAll( this );
		},

		render : function() {
			this.$el.empty().append( gc.template( 'payment', this.generatePaymentTemplateVars() ) );

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#view-container' );
			}
		},

		generatePaymentTemplateVars : function() {
			var stache = {
					attendees : [],
					total_cost : 0,
					more_than_one_attendee : gc.app.attendeeCollection.length > 1
				},
				mealQuestions = gc.app.questionCollection.findWhere( { question_name : 'meal_plan' } ).attributes.answers,
				meals,
				breakfasts,
				lunches,
				dinners,
				i, j;

			for ( i = 0; i < gc.app.attendeeCollection.length; i++ ) {
				breakfasts = [];
				lunches = [];
				dinners = [];

				stache.attendees.push( { name : gc.app.attendeeCollection.models[ i ].answerCollection.findWhere( { field : 'first_name' } ).attributes.value +' '+ gc.app.attendeeCollection.models[ i ].answerCollection.findWhere( { field : 'last_name' } ).attributes.value } );

				meals = JSON.parse( gc.app.attendeeCollection.models[ i ].answerCollection.findWhere( { field : 'meal_plan' } ).attributes.value );
				stache.attendees[ i ].registration_cost = gc.app.attendeeCollection.models[ i ].paymentModel.setRegistrationCost();

				gc.app.attendeeCollection.models[ i ].paymentModel.calculateTotalCostFromSavedAnswer();

				for ( j = 0; j < mealQuestions.length; j++ ) {
					meals[ mealQuestions[ j ].name ].breakfast && breakfasts.push( mealQuestions[ j ].display );
					meals[ mealQuestions[ j ].name ].lunch && lunches.push( mealQuestions[ j ].display );
					meals[ mealQuestions[ j ].name ].dinner && dinners.push( mealQuestions[ j ].display );
				}

				stache.attendees[ i ].total_meal_cost = gc.app.attendeeCollection.models[ i ].paymentModel.attributes.cost_from_breakfast + gc.app.attendeeCollection.models[ i ].paymentModel.attributes.cost_from_lunch + gc.app.attendeeCollection.models[ i ].paymentModel.attributes.cost_from_dinner;
				stache.attendees[ i ].breakfast_cost = gc.app.attendeeCollection.models[ i ].paymentModel.attributes.cost_from_breakfast;
				stache.attendees[ i ].lunch_cost = gc.app.attendeeCollection.models[ i ].paymentModel.attributes.cost_from_lunch;
				stache.attendees[ i ].dinner_cost = gc.app.attendeeCollection.models[ i ].paymentModel.attributes.cost_from_dinner;
				stache.attendees[ i ].breakfast_days = breakfasts.join( ', ' ) || false;
				stache.attendees[ i ].lunch_days = lunches.join( ', ' ) || false;
				stache.attendees[ i ].dinner_days = dinners.join( ', ' ) || false;
				stache.attendees[ i ].total_cost = gc.app.attendeeCollection.models[ i ].paymentModel.attributes.total_cost;
				stache.total_cost += gc.app.attendeeCollection.models[ i ].paymentModel.attributes.total_cost;
			}

			return stache;
		},

		proceedWithPayment : function() {
			var baseUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=MNUGKS74MHQ6C',
				params = [
					'amount=' + gc.app.paymentModel.attributes.total_cost,
					'invoice=' + gc.app.attendee_id,
					'notify_url=http://registration.graceconference.org/api/set/attendee_payment',
					'return_url=http://registration.graceconference.org/'
				];

			window.location.href = baseUrl +'&'+ params.join( '&' );
			return false;
		},

		resetForm : function() {
			var self = this;

			gc.app.resetForm().done( function() {
				self.$el.detach().empty();
			} );

			return false;
		}
	};

	t.completionViewCore = {
		events : {
			'click .js-restart-form' : 'resetForm'
		},

		initialize : function() {
			_.bindAll( this );
		},

		render : function() {
			this.$el.empty().append( gc.template( 'completion', {} ) );

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#view-container' );
			}
		},

		resetForm : function( ev ) {
			var self = this;

			ev.currentTarget.innerHTML = 'Resetting questions…';

			gc.app.resetForm().done( function() {
				self.$el.detach().empty();
			} );

			return false;
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
			var result;

			if ( Modernizr.localstorage ) {
				result = window.localStorage.getItem( key );
			}

			if ( !result ) {
				result = gc.session[ key ];
			}

			return result;
		};

		this.remove = function( key ) {
			if ( Modernizr.localstorage ) {
				window.localStorage.removeItem( key );
			}
		};

		this.clear = function() {
			if ( Modernizr.localstorage ) {
				window.localStorage.clear();
			}

			return false;
		};
	};

	gc.init( function() {
		t.init.initialize();
	} );
} )( jQuery, _, Backbone, Modernizr, tester, gc );
