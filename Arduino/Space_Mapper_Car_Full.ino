// LEFT = MOTOR A, RIGHT = MOTOR B
// hall effect readings/rev = 7;

#define pwmR 4 //pwmB
#define pwmL 5 //pwmA
#define R2 12 //BI2
#define R1 11 //BI1
#define L1 10 //AI1
#define L2 9 //AI2

#define encoderR1 2 //C1 on side sensor
#define encoderL1 3 //C1 on front sensor

#define IRF A1 //IR sensor inputs 
#define IRR A0

const int avgInterval = 50; //interval tracked for averaging
int IRFAvgs[2]; //stores stabilized dist vals
int IRRAvgs[2];
int avgCounter = 0;

const int minIRF = 500; //ignore readings lower than these
const int minIRR = 500;

const int lSpeed = 200; //stays constant
int rSpeed = 200; //adjusts to match r=lSpeed

volatile int lTurns = 0; //# of rotations per motor
volatile int rTurns = 0;
volatile int lTotal = 0;
volatile int rTotal = 0;

volatile int lSense = 0; //time of last sense per motor
volatile int rSense = 0;


static int IRRVal = 0; //IR sensor vaues
static int IRFVal = 0;


void setup() {
  Serial.begin(9600);
  pinMode(pwmR, OUTPUT);
  pinMode(pwmL, OUTPUT);
  pinMode(R1, OUTPUT);
  pinMode(R2, OUTPUT);
  pinMode(L1, OUTPUT);
  pinMode(L2, OUTPUT);
  pinMode(encoderR1, INPUT_PULLUP);
  pinMode(encoderR2, INPUT_PULLUP);
  pinMode(encoderL1, INPUT_PULLUP);
  pinMode(encoderL2, INPUT_PULLUP);
  
  analogWrite(pwmR, rSpeed);
  analogWrite(pwmL, lSpeed);
  
  attachInterrupt(digitalPinToInterrupt(encoderL1),interruptL,RISING);
  attachInterrupt(digitalPinToInterrupt(encoderR1),interruptR,RISING);
}

int keyIn = 0; //holds inputted keystroke

void loop() {

  lTurns = 0; //reset # of encoder turns per motor
  rTurns = 0;

  int avgR = 0; //calculate average IR sensor reads
  int avgF = 0;
  
  for (int i = 0; i < avgInterval; i++) {
    avgR+=analogRead(IRR); 
    avgF+=analogRead(IRF);
  }
  avgR/=avgInterval; //calculate averages per IR sensor
  avgF/=avgInterval;
  
  IRFAvgs[avgCounter] = avgF; //store 2 most recent values
  IRRAvgs[avgCounter] = avgR;
  avgCounter++;
  
  if (avgCounter == 2) {
    avgCounter = 0;
  }
  //difference in last 2 readings per sensor
  int IRFDiff = (abs(IRFAvgs[0] - IRFAvgs[1]));
  int IRRDiff = (abs(IRRAvgs[0] - IRRAvgs[1]));

  //ignore value if difference is too high
  if (IRFDiff < 25) {
    if (avgF < minIRF) {
      IRFVal = 0;
    } else {
      IRFVal = avgF;
    }
  }
  if (IRRDiff < 25) {
    if (avgR < minIRR) {
      IRRVal = 0;
    } else {
      IRRVal = avgR;
    }
  }

  if (Serial.available() > 0) { //keyboard input received
    keyIn = Serial.read(); //record key pressed
    moveCar(keyIn);
  }
  
  matchSpeeds();
 
  analogWrite(pwmL, lSpeed);
  analogWrite(pwmR, rSpeed);

  
  Serial.print(IRFVal);
  Serial.print(",");
  Serial.print(IRRVal);
  Serial.print(",");
  Serial.print(lTurns);
  Serial.print(",");
  Serial.println(rTurns);
  
}


void moveCar(int key) {
  switch (key) {
    default:
      leftOff();
      rightOff();
      break;
    case 119: //W key
      leftForward();
      rightForward();
      break;
    case 97: //A key
      leftBack();
      rightForward();
      break;
    case 115: //S key
      leftBack();
      rightBack();
      break;
    case 100: //D key
      leftForward();
      rightBack();
      break;
  }
}

void interruptL() {
  if (digitalRead(encoderL2) == 0) {
    lTurns--;
    lTotal--;
  } else {
    lTurns++;
    lTotal++;
  }

}
void interruptR() {
  if (digitalRead(encoderR2) == 0) { //motor turning forward
    rTurns++;
    rTotal++;
  } else {
    rTurns--;
    rTotal--;
  }

}

void matchSpeeds() { //matches left and right motor speeds
  if (abs(rTurns) > abs(lTurns)) { //if R is faster 
    rSpeed--;
  } else if (abs(rTurns) < abs(lTurns)) { //if L is faster:
    rSpeed++;
  }
}

//functions to move or stop individual motors
void leftForward() {
  digitalWrite(L1, HIGH);
  digitalWrite(L2, LOW);
}
void leftBack() {
  digitalWrite(L1, LOW);
  digitalWrite(L2, HIGH);
}
void rightForward() {
  digitalWrite(R1, HIGH);
  digitalWrite(R2, LOW);
}
void rightBack() {
  digitalWrite(R1, LOW);
  digitalWrite(R2, HIGH);
}
void rightOff() {
  digitalWrite(R2, LOW);
  digitalWrite(R1, LOW);
}
void leftOff() {
  digitalWrite(L1, LOW);
  digitalWrite(L2, LOW);
}

void resetDir() {
  leftOff();
  rightOff();
}
