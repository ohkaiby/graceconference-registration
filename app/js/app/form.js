( function( $, tester, undefined ) {
	var t = tester || {};

	t.init = function() {
		gc.models.question = Backbone.Model.extend( t.questionsModelCore );
		gc.app.questionsCollection = new ( Backbone.Collection.extend( t.questionsCollectionCore ) )();

		gc.models.answer = Backbone.Model.extend( t.answersModelCore );
		gc.app.answersCollection = new ( Backbone.Collection.extend( t.answersCollectionCore ) )();

		gc.app.formView = new ( Backbone.View.extend( t.formViewCore ) )( { collection : gc.app.questionsCollection } );
		gc.app.progressBarView = new( Backbone.View.extend( t.progressBarViewCore ) )( { collection : gc.app.answersCollection } );
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
					question_name : 'age',
					question : 'How old are you?',
					answer_type : 'radio',
					answers : [
						{ name : '12_17', display : '12 to 17 years old' },
						{ name : '18', display : '18+ years old' }
					],
					dependents : [
						{ question_name : 'grade', dependent_answer : '12_17' },
						{ question_name : 'status', dependent_answer : '18' }
					]
				},

				{
					question_name : 'grade',
					question : 'What grade are you in?',
					answer_type : 'radio',
					answers : [
						{ name : '6th', display : '6th grade' },
						{ name : '7th', display : '7th grade' },
						{ name : '8th', display : '8th grade' },
						{ name : 'freshmen', display : 'Freshmen' },
						{ name : 'sophomore', display : 'Sophomore' },
						{ name : 'junior', display : 'Junior' },
						{ name : 'senior', display : 'Senior' }
					]
				},

				{
					question_name : 'status',
					question : 'You are… ?',
					answer_type : 'radio',
					answers : [
						{ name : 'high_school_18', display : 'Still in high school' },
						{ name : 'undergrad', display : 'In college (undergrad)' },
						{ name : 'graduate', display : 'In college (graduate)' },
						{ name : 'single', display : 'Single and not in school' },
						{ name : 'married', display : 'Married' }
					],
					dependents : [
						{ question_name : 'undergrad_year', dependent_answer : 'undergrad' },
						{ question_name : 'kids', dependent_answer : 'single' },
						{ question_name : 'kids', dependent_answer : 'married' }
					]
				},

				{
					question_name : 'undergrad_year',
					question : 'What year in undergrad?',
					answer_type : 'radio',
					answers : [
						{ name : '1st', display : 'First year' },
						{ name : '2nd', display : 'Second year' },
						{ name : '3rd', display : 'Third year' },
						{ name : '4th', display : 'Fourth year' },
						{ name : '5th_plus', display : 'Fifth+ year' }
					]
				},

				{
					question_name : 'toddlers',
					question : 'Are you bringing any toddlers?',
					answer_type : 'radio',
					answers : [
						{ name : 'yes', display : 'Yes' },
						{ name : 'no', display : 'No' }
					],
					dependents : [
						{ question_name : 'how_many_toddlers', dependent_answer : 'yes' }
					]
				},

				{
					question_name : 'how_many_toddlers',
					question : 'How many toddlers are you bringing?',
					answer_type : 'text',
					answers : [
						{ name : 'how_many_toddlers', display : '# of toddlers' }
					]
				},

				{
					question_name : 'church_attendance',
					question : 'Are you attending church services regularly?',
					answer_type : 'radio',
					answers : [
						{ name : 'church_yes', display : 'Yes, I attend church regularly' },
						{ name : 'church_no', display : 'No, I don’t attend church regularly' }
					]
				}
			],
			i;

		for ( i = 0; i < questions.length; i++ ) {
			gc.app.questionsCollection.add( new gc.models.question( questions[ i ] ) );
		}
	};

	t.questionsModelCore = { // a single question
		defaults : {
			question_name : '', // question name attribute (for referrals from other questions)
			question : '', // the actual question
			answer_type : 'text', // answer input type attribute
			answers : [], // answer is in format: { name : 'input_name', display : 'A String' }. text input fields use 'display' as their placeholder text.
			dependents : [] // questions that are dependent on an answer. dependent format: { question_name, dependent_answer }
		}
	};

	t.questionsCollectionCore = { // the collection of all questions
		initialize : function() {
			_.bindAll( this );
		},

		getFirstUnansweredQuestion : function() {
			var i;

			for ( i = 0; i < this.models.length; i++ ) {
				if ( !gc.app.answersCollection.findWhere(
					{ associated_question : this.models[ i ].get( 'question_name' ) }
				) ) {
					return this.models[ i ];
				}
			}

			return false; // all questions answered
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
		el : '#form',
		events : {
			'submit form' : 'processAnswer'
		},

		initialize : function() {
			_.bindAll( this );
		},

		render : function() {
			var questionModel = gc.app.selected.question = this.collection.getFirstUnansweredQuestion();

			if ( !questionModel ) { // all questions are answered
				this.renderComplete();
			}

			this.renderQuestion( questionModel.toJSON() );
			return this;
		},

		renderQuestion : function( stache ) {
			stache[ stache.answer_type ] = true;

			this.$el.empty().append( gc.template( 'question', stache ) );
		},

		renderComplete : function() {

		},

		processAnswer : function() {
			if ( this.validateAnswer() ) {
				this.saveAnswer().render();
			} else {
				this.$el.find( '.alert' ).show();
			}

			// if it's the last answer, save to db.


			return false;
		},

		validateAnswer : function() {
			var answerEls,
				i;

			if ( gc.app.selected.question.get( 'answer_type' ) === 'text' ) {
				answerEls = this.$el.find( 'input' );
				for ( i = 0; i < answerEls.length; i++ ) {
					if ( _.isEmpty( $.trim( answerEls[ i ].value ) ) ) {
						return false;
					}
				}
			} else if ( gc.app.selected.question.get( 'answer_type' ) === 'radio' ) {
			}

			return true;
		},

		saveAnswer : function() {
			var rawAnswers = [],
				answersFormattedForCollection = [],
				i;

			if ( gc.app.selected.question.get( 'answer_type' ) === 'text' ) {
				rawAnswers = this.generateTextAnswers();
			} else if ( gc.app.selected.question.get( 'answer_type' ) === 'radio' ) {
			}

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

		addAnswer : function( rawAnswer, collectedAnswers ) {
			var existingAnswer;

			if ( existingAnswer = gc.app.answersCollection.findWhere( { field : rawAnswer.field } ) ) {
				existingAnswer.set( 'value', rawAnswer.value );
			} else {
				collectedAnswers.push( new gc.models.answer( rawAnswer ) );
			}
		}
	};

	t.answersViewCore = {
		className : 'answers',

		initialize : function() {
			_.bindAll( this );

			this.collection.on( 'add', this.render );
			this.collection.on( 'change', this.render );
			this.collection.on( 'reset', this.reset );
		},

		render : function() {
			this.$el.empty().append( gc.template( 'answers', this.generateTemplateVars() ) );

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '#answers' );
			}
		},

		generateTemplateVars : function() {
			var stache = {
					answers : this.collection.toJSON()
				};

				return stache;
		},

		reset : function() {
			this.$el.empty();
		}
	};

	t.progressBarViewCore = {
		el : '#progress',

		initialize : function() {
			_.bindAll( this );

			this.collection.on( 'add', this.render );
			this.collection.on( 'change', this.render );
			this.collection.on( 'reset', this.reset );
		},

		render : function() {
			this.$el.
				show().
				find( '.bar' ).css( 'width', this.getPercentageComplete() + '%' );
		},

		getPercentageComplete : function() {
			return 100;
		},

		reset : function() {
			this.$el.hide();
		}
	};

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
} )( jQuery, tester, undefined );
