<template>
    <div class="main-container">
    <div class="main-table">
      <h2>New Test</h2>

     <loading :active.sync="isComputing" :is-full-page="false"/>
     
      <template v-if="!getTests">
        <h3 v-if="!isComputing">Oops... something went wrong!</h3>
      </template>

      <template v-else>
      <test-progress-modal :is-visible="isTestProgressModalVisible"
      :test-results-size="this.testResultsSize"
      :test-call-completed="this.isTestCallCompleted" :test-call-id="this.testCallId" :test-obj="this.tests[this.selectedTest]" 
      :test-users="this.edt_users" :test-amount="this.edt_queries" @hide="closeModal"/>

      <form>
        <div class="form-group">
          <div class="row">
            <label for="sel_test_type">Test Type</label>
            <select name="sel_test_type" v-model="selectedTest" @change="onChange" class="browser-default custom-select">
                <option v-for="(test, index) in this.tests=getTests" v-bind:value="index" :key="test.pk"> {{ test.name }} </option>
            </select>
          </div><br>
          <div class="row">
            <label v-if="edt_users != null" for="edt_users">User Amount</label>
            <input type="number" name="edt_users" v-model="edt_users" @change="onChange" min="1" step="1" :max="maxUsers"
             value=null class="form-control" placeholder="User Amount"
             v-model.trim="$v.edt_users.$model"
             :class="{'is-invalid':$v.edt_users.$error, 'is-valid':!$v.edt_users.$invalid }">
            <div class="invalid-feedback">
                <span v-if="!$v.edt_users.required">User Amount is required</span>
                <span v-else-if="!$v.edt_users.minValue">User Amount must be a positive number</span>
                <span v-else-if="!$v.edt_users.numeric">User Amount must be a numeric value</span>
                <span v-else-if="!$v.edt_users.maxValue">User Amount must not exceed {{maxUsers}}</span>
            </div>
          </div><br>
          <div class="row">
            <label v-if="edt_queries != null" for="edt_queries">Test Queries</label>
            <input type="number" name="edt_queries" v-model="edt_queries" @change="onChange" min="1" step="1"
             value=null class="form-control" placeholder="Test Queries"
             v-model.trim="$v.edt_queries.$model"
             :class="{'is-invalid':$v.edt_queries.$error, 'is-valid':!$v.edt_queries.$invalid }">
            <div class="invalid-feedback">
                <span v-if="!$v.edt_queries.required">Test Queries are required</span>
                <span v-else-if="!$v.edt_queries.minValue">Test Queries amount must be a positive number</span>
                <span v-else-if="!$v.edt_queries.numeric">Test Queries amount must be a numeric value</span>
            </div>
          </div><br>
          <div class="row">
            <template v-if="this.isLastTestFinished">
              <input @click="showModal()" type="button" class="btn btn-success btn-lg btn-block" value="Start Test"/>
            </template>

            <template v-else>
              <template v-if="this.allowATRmessage">
                <label v-if="!isComputing" for="button">Another test is already running, please wait...</label>
              </template>
              <input type="button" class="btn btn-success btn-lg btn-block" disabled value="Start Test"/>
            </template>
          </div>
        </div>
      </form>

      </template>

    </div>
  </div>
</template>

<script>
import {required, numeric, minValue, maxValue} from "vuelidate/lib/validators";
import TestProgressModal from "@/components/TestProgressModal";
import {mapGetters, mapActions} from "vuex";
import router from "@/router";
import jQuery from 'jquery';

export default {
    name: "GenerateTests",
    computed: {
    ...mapGetters(["getTests", "allDoneTests"]),
    },
    components: {TestProgressModal},
    data() {
    return {
        testObj: null,
        isTestProgressModalVisible: false,
        selectedTest : 1,
        edt_users: null,
        edt_queries: null,
        isComputing: false,
        allowATRmessage: false,
        tests: {
          pk: "0",
          name: "testName",
          description: "testDescription",
          stockAmount: "1",
        },
        timer: 0,
        timerUT: 0,
        isLastTestFinished: false,
        isTestCallCompleted: false,
        testResultsSize: 0,
        testCallId: 0,
        maxUsers: process.env.VUE_APP_TEST_MAX_USERS,
    }
  },
  methods: {
    ...mapActions(["getAllTests", "addTest", "getDoneTest", "getDoneTests"]),
    onChange(){},
    checkForUnfinishedTests(){
      if(this.isTestProgressModalVisible == false){
        try {
              this.timerUT = setInterval((function ()
              {
                this.getDoneTests();
                
                if(this.allDoneTests.length == 0){
                  this.isLastTestFinished = true;
                }
                else{
                  this.allowATRmessage = true;
                  this.isLastTestFinished = this.allDoneTests[0].is_finished;
                }
              
                if(this.isLastTestFinished == null) this.isLastTestFinished = true;

              }).bind(this), 3000)
        }
        catch(e){
          console.log(e);
          this.isLastTestFinished = true;
        }
      }else if(this.isLastTestFinished == false){
        this.isLastTestFinished = true;
      }
    },
    showModal() {
        this.$v.$touch();
        if (this.$v.$invalid) {
            alert('Fill all fields correctly before generating a test')
        } 
        else {
            let par_id = this.tests[this.selectedTest].id;
            let par_users = this.edt_users;
            let par_queries = this.edt_queries;
            let data = {
              testId: par_id, 
              testUsers: par_users, 
              testAmount: par_queries
            };
            
            this.testResultsSize = 0;
            this.addTest(data).then(response => {
              if(response.status === 200 || response.status === 201){
                this.isTestProgressModalVisible = true;

                let { id, is_finished } = response.data;

                if (is_finished === false)
                {
                  try {
                    this.timer = setInterval((function ()
                    {
                      this.getDoneTest(id).then(doneTestResponse => 
                      {                       
                        if(doneTestResponse.status !== 200)
                        {
                          alert(`${doneTestResponse.status}: ${doneTestResponse.data.error}`);
                        } 
                        else 
                        { 
                          this.testCallId = id;
                          this.closeModal();
                          clearInterval(this.timerUT);
                          this.$emit('hide');
                          jQuery('#modalTestProgress').modal('hide');
                          router.replace('/test/done/' + this.testCallId)

                          if(doneTestResponse.data.is_finished)
                          {
                            clearInterval(this.timer);

                            this.isTestCallCompleted = true;
                          }

                        }
                      });
                    }).bind(this), 10000)
                  }
                  catch(e){
                    console.log(e);
                  }
                }
                else
                {
                  this.isTestCallCompleted = true;
                  this.testCallId = id;
                }

              } else {
                alert(`${response.status}: ${response.data.error}`);
              }
              }).catch(error => {
                  alert(`${error}`)
              });
        }
    },
    closeModal() {
      clearInterval(this.timer);
      this.isTestProgressModalVisible = false;
      this.isTestCallCompleted = false;
      //this.testCallId = 0;
    }
  },
  async created() {
    this.isComputing = true;
    await this.getAllTests();
    await this.getDoneTests();
    this.isComputing = false;
    this.checkForUnfinishedTests();
  },
  validations() {
    return {
      edt_users: {
        required,
        numeric,
        minValue: minValue(1),
        maxValue: maxValue(this.maxUsers)
      },
      edt_queries: {
        required,
        numeric,
        minValue: minValue(1)
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timerUT);
  }
}
</script> 
