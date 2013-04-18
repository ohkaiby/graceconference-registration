/*global jQuery:false*/
/*global Backbone:false*/
/*global gc:false*/
/*global _:false*/
/*global tester:false*/

( function( $, tester, undefined ) {
	var t = tester || {};

	t.init = function() {
		gc.models.question = Backbone.Model.extend( t.questionsModelCore );
		gc.app.questionsCollection = new ( Backbone.Collection.extend( t.questionsCollectionCore ) )();

		gc.models.answer = Backbone.Model.extend( t.answersModelCore );
		gc.app.answersCollection = new ( Backbone.Collection.extend( t.answersCollectionCore ) )();

		gc.app.formView = new ( Backbone.View.extend( t.formViewCore ) )( { collection : gc.app.questionsCollection } );

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
						{ name : 'first_name', display : 'First name' },
						{ name : 'last_name', display : 'Last name' }
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
					],
					dependents : [
						{ question_name : 'church_name', dependent_answer : 'church_yes' }
					]
				},

				{
					question_name : 'church_name',
					question : 'Great! Which church do you go to?',
					answer_type : 'text',
					answers : [
						{ name : 'church_name', display : 'Name of church' }
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
			answer_type : 'link', // answer input type attribute
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
					{ question_name : this.models[ i ].get( 'question_name' ) }
				) ) {
					return this.models[ i ];
				}
			}

			return false; // all questions answered
		}
	};

	t.answerModelCore = { // an answer to a question
		defaults : {
			question_name : '', // corresponding to the question asked,
			answer_value : undefined // the answer
		}
	};

	t.answersCollectionCore = { // collection of all answers

	};

	t.formViewCore = {
		id : 'form',

		initialize : function() {
			_.bindAll( this );
		},

		render : function() {
			var questionModel = this.collection.getFirstUnansweredQuestion();

			if ( this.$el.parent().length === 0 ) {
				this.$el.appendTo( '.form-container' );
			}

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

		}
	};

	gc.init( function() {
		t.init();
	} );
} )( jQuery, tester, undefined );
