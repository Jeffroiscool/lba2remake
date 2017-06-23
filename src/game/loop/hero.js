import THREE from 'three';
import {DirMode} from '../actors';

export function updateHero(game, hero, time) {
    handleBehaviourChanges(game, hero);
    processActorMovement(game.controlsState, hero, time);
}

function handleBehaviourChanges(game, hero) {
    if (hero.props.entityIndex != game.getState().hero.behaviour) {
        hero.props.entityIndex = game.getState().hero.behaviour;
        toggleJump(game.controlsState, hero, false);
        hero.resetAnimState();
    }
}

function toggleJump(controlsState, hero, value) {
    controlsState.jump = value;
    hero.props.flags.hasCollisions = !value; // temporary to allow jump on Y axis
}

function processActorMovement(controlsState, hero, time) {
    if (hero.props.dirMode != DirMode.MANUAL)
        return;

    let animIndex = hero.props.animIndex;
    if (controlsState.jump && hero.animState.hasEnded){
        toggleJump(controlsState, hero, false);
    } else {
        hero.isWalking = false;
        animIndex = 0;
    }
    if (controlsState.heroSpeed != 0) {
        hero.isWalking = true;
        animIndex = controlsState.heroSpeed == 1 ? 1 : 2;
    }
    if (controlsState.jump) {
        toggleJump(controlsState, hero, true);
        hero.isWalking = true;
        animIndex = 14; // jump
        if (controlsState.heroSpeed != 0) {
            animIndex = 25; // jump while running
        }
    }
    if (controlsState.heroRotationSpeed != 0) {
        toggleJump(controlsState, hero, false);
        const euler = new THREE.Euler();
        euler.setFromQuaternion(hero.physics.orientation, 'YXZ');
        euler.y += controlsState.heroRotationSpeed * time.delta * 1.2;
        hero.physics.temp.angle = euler.y;
        if (controlsState.heroSpeed == 0) {
            animIndex = controlsState.heroRotationSpeed == 1 ? 3 : 4;
        }
        hero.physics.orientation.setFromEuler(euler);
    }
    if (hero.props.animIndex != animIndex) {
        hero.props.animIndex = animIndex;
        hero.resetAnimState();
    }
}