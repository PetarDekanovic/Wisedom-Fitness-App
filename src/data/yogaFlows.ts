import { YogaFlow } from '../types';

export const YOGA_FLOWS: YogaFlow[] = [
  {
    id: 'beginner-flow',
    name: "An Easy Beginner's Flow",
    description: "A gentle introduction to Yin Yoga with 3-minute holds to target deep connective tissues.",
    poses: [
      { id: 'b1', name: 'Opening Meditation', duration: 180 },
      { id: 'b2', name: 'Butterfly', duration: 180, counterPose: 'Windshield Wipers' },
      { id: 'b3', name: 'Half Butterfly (Right)', duration: 180 },
      { id: 'b4', name: 'Half Butterfly (Left)', duration: 180 },
      { id: 'b5', name: 'Straddle Fold', duration: 180, counterPose: 'Windshield Wipers' },
      { id: 'b6', name: "Child's Pose", duration: 60 },
      { id: 'b7', name: 'Sphinx', duration: 180 },
      { id: 'b8', name: 'Seal', duration: 180 },
      { id: 'b9', name: "Child's Pose", duration: 60 },
      { id: 'b10', name: 'Half Shoelaces (Right)', duration: 180 },
      { id: 'b11', name: 'Half Shoelaces (Left)', duration: 180, counterPose: 'Windshield Wipers' },
      { id: 'b12', name: 'Happy Baby', duration: 180 },
      { id: 'b13', name: 'Reclining Twist (Right)', duration: 180 },
      { id: 'b14', name: 'Reclining Twist (Left)', duration: 180 },
      { id: 'b15', name: 'Shavasana', duration: 300 },
      { id: 'b16', name: 'Finishing Meditation', duration: 180 },
    ]
  },
  {
    id: 'spine-flow',
    name: "Flow for the Spine",
    description: "Targets the spine through its 6 degrees of freedom: flexion, extension, lateral flexions, and twists.",
    poses: [
      { id: 's1', name: 'Meditation', duration: 180 },
      { id: 's2', name: 'Butterfly', duration: 240, counterPose: 'Windshield Wipers' },
      { id: 's3', name: 'Half Butterfly (Right)', duration: 240, counterPose: 'Windshield Wipers' },
      { id: 's4', name: 'Half Butterfly (Left)', duration: 240, counterPose: 'Windshield Wipers' },
      { id: 's5', name: 'Caterpillar', duration: 240, counterPose: "Cat's Breath" },
      { id: 's6', name: 'Supported Bridge', duration: 240, counterPose: 'Hug knees to chest' },
      { id: 's7', name: 'Sphinx', duration: 240, counterPose: 'Relax on abdomen' },
      { id: 's8', name: 'Bananasana (Right)', duration: 240, counterPose: 'Hug knees to chest' },
      { id: 's9', name: 'Bananasana (Left)', duration: 240, counterPose: 'Hug knees to chest' },
      { id: 's10', name: 'Two-knee Reclining Twist (Right)', duration: 240, counterPose: 'Hug knees to chest' },
      { id: 's11', name: 'Two-knee Reclining Twist (Left)', duration: 240, counterPose: 'Hug knees to chest' },
      { id: 's12', name: 'Shavasana', duration: 420 },
    ]
  }
];
