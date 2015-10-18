export var toRadians = angle => angle * Math.PI / 180;

export var getDistanceFromCode = (playerLocation, codeLocation) => {
    let plLatitude = toRadians(parseFloat(playerLocation.latitude)),
        plLongitude = toRadians(parseFloat(playerLocation.longitude)),
        playerDistance = Math.acos(
            Math.sin(codeLocation[0]) * Math.sin(plLatitude)
            + Math.cos(codeLocation[0]) * Math.cos(plLatitude) * Math.cos(codeLocation[1] - plLongitude)
            ) * 6369000;

    return playerDistance;
};
