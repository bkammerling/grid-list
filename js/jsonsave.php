<?php


    $postdata = file_get_contents("php://input");
    echo $postdata;
    if($postdata != null) {
        $data = json_decode($postdata);
        $json = $data->json;

        if (json_decode($postdata) != null) { /* sanity check */
            file_put_contents('countries.json', print_r($postdata, true));
        } else {
            return 'error';
        }
    }

?>
