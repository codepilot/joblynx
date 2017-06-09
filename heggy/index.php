<?php

print_r($_POST);

?>
<form action="https://diamondcompute.com/heggy/" method=post>
    <input name="firstname" type="text" value="<?= $_POST['firstname']; ?>" />
    <input type="submit" name="pushed" />
</form>