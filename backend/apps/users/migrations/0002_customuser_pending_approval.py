from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='pending_approval',
            field=models.BooleanField(db_index=True, default=False, verbose_name='待审批'),
        ),
    ]
